-- WalanoCast — transactional business logic as security-definer RPCs.
-- Each function is one atomic transaction. Errors use WC_* message codes
-- that API routes map to user-facing messages.
-- Spec: walano-cast-backend-spec.md §4.

-- ── internal audit helper ────────────────────────────────────────────────

create or replace function public._audit(
  p_actor uuid, p_action text, p_entity_type text, p_entity_id uuid,
  p_details jsonb default '{}'::jsonb, p_ip text default null, p_ua text default null
) returns void language sql
set search_path = public as $$
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details, ip, user_agent)
  values (p_actor, p_action, p_entity_type, p_entity_id, coalesce(p_details, '{}'::jsonb), p_ip, p_ua);
$$;

revoke execute on function public._audit from public, anon, authenticated;

-- ── U3: create_order ─────────────────────────────────────────────────────
-- Reserve-at-order (decision #5): atomically reserves one item/slot.
-- checkout_data is validated against category.checkout_fields in the API
-- route before this is called; the DB stores it as-is.

create or replace function public.create_order(
  p_plan_id uuid,
  p_payment_method_id uuid,
  p_checkout_data jsonb default '{}'::jsonb
) returns public.orders
language plpgsql security definer
set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_plan public.plans%rowtype;
  v_service public.services%rowtype;
  v_category public.categories%rowtype;
  v_order public.orders%rowtype;
  v_claimed uuid;
begin
  if v_uid is null then
    raise exception 'WC_UNAUTHENTICATED';
  end if;

  select * into v_plan from public.plans where id = p_plan_id and is_active;
  if not found then raise exception 'WC_PLAN_NOT_FOUND'; end if;

  select * into v_service from public.services where id = v_plan.service_id and is_active;
  if not found then raise exception 'WC_PLAN_NOT_FOUND'; end if;

  select * into v_category from public.categories where id = v_service.category_id and is_active;
  if not found then raise exception 'WC_PLAN_NOT_FOUND'; end if;

  if not exists (select 1 from public.payment_methods where id = p_payment_method_id and is_active) then
    raise exception 'WC_PAYMENT_METHOD_NOT_FOUND';
  end if;

  -- anti stock-locking: max 3 live pending orders per user (decision #5)
  if (select count(*) from public.orders
      where user_id = v_uid and status = 'pending_payment' and expires_at > now()) >= 3 then
    raise exception 'WC_TOO_MANY_PENDING';
  end if;

  insert into public.orders (
    user_id, plan_id, category_id, delivery_type_snapshot, checkout_data,
    amount_expected, currency, payment_method_id, expires_at
  ) values (
    v_uid, v_plan.id, v_category.id, v_category.delivery_type,
    coalesce(p_checkout_data, '{}'::jsonb),
    v_plan.price_amount, v_plan.price_currency, p_payment_method_id,
    now() + interval '24 hours'
  ) returning * into v_order;

  if v_category.delivery_type = 'auto_inventory' then
    if v_category.inventory_kind = 'item' then
      update public.inventory_items
      set status = 'reserved', order_id = v_order.id
      where id = (
        select id from public.inventory_items
        where service_id = v_service.id
          and (plan_id = v_plan.id or plan_id is null)
          and status = 'available'
        order by plan_id nulls last, created_at
        limit 1 for update skip locked
      ) returning id into v_claimed;
    else -- slot
      update public.account_slots
      set status = 'reserved', order_id = v_order.id
      where id = (
        select sl.id from public.account_slots sl
        join public.shared_accounts sa on sa.id = sl.shared_account_id
        where sa.service_id = v_service.id and sa.status = 'active' and sl.status = 'free'
        order by sa.created_at
        limit 1 for update skip locked
      ) returning id into v_claimed;
    end if;

    if v_claimed is null then
      -- rolls back the INSERT above too
      raise exception 'WC_OUT_OF_STOCK';
    end if;
  end if;

  perform public._audit(v_uid, 'order.created', 'order', v_order.id,
    jsonb_build_object('ref', v_order.ref, 'plan_id', v_plan.id, 'amount', v_order.amount_expected));

  return v_order;
end $$;

-- ── U4: submit_txn ───────────────────────────────────────────────────────
-- Expected failures RETURN an outcome instead of raising: a raise would roll
-- back the txn_submission_attempts log row, and rate limiting depends on
-- failed attempts being recorded. Only unauthenticated raises.
-- Returns: { outcome: 'accepted'|'not_found'|'bad_status'|'expired'|
--            'bad_format'|'duplicate'|'rate_limited', order: <row|null> }

create or replace function public.submit_txn(
  p_order_id uuid,
  p_txn_id text,
  p_ip text default null,
  p_ua text default null
) returns jsonb
language plpgsql security definer
set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders%rowtype;
  v_txn text;
  v_pattern text;

begin
  if v_uid is null then raise exception 'WC_UNAUTHENTICATED'; end if;

  -- rate limits (decision #3): 5 attempts/hour total, 3 accepted/hour
  if (select count(*) from public.txn_submission_attempts
      where user_id = v_uid and created_at > now() - interval '1 hour') >= 5
     or (select count(*) from public.txn_submission_attempts
      where user_id = v_uid and outcome = 'accepted'
        and created_at > now() - interval '1 hour') >= 3 then
    insert into public.txn_submission_attempts (user_id, order_id, transaction_id_tried, outcome, ip, user_agent)
    values (v_uid, p_order_id, p_txn_id, 'rate_limited', p_ip, p_ua);
    return jsonb_build_object('outcome', 'rate_limited', 'order', null);
  end if;

  select * into v_order from public.orders
  where id = p_order_id and user_id = v_uid
  for update;
  if not found then
    return jsonb_build_object('outcome', 'not_found', 'order', null);
  end if;

  if v_order.status not in ('pending_payment', 'rejected') then
    return jsonb_build_object('outcome', 'bad_status', 'order', to_jsonb(v_order));
  end if;
  if v_order.status = 'pending_payment' and v_order.expires_at < now() then
    return jsonb_build_object('outcome', 'expired', 'order', to_jsonb(v_order));
  end if;

  v_txn := upper(trim(p_txn_id));
  select txn_id_pattern into v_pattern from public.payment_methods where id = v_order.payment_method_id;

  if v_txn is null or length(v_txn) < 4 or length(v_txn) > 64
     or (v_pattern is not null and v_txn !~ v_pattern) then
    insert into public.txn_submission_attempts (user_id, order_id, transaction_id_tried, outcome, ip, user_agent)
    values (v_uid, p_order_id, p_txn_id, 'bad_format', p_ip, p_ua);
    return jsonb_build_object('outcome', 'bad_format', 'order', to_jsonb(v_order));
  end if;

  -- friendly duplicate check; the partial unique index is the hard guarantee
  if exists (select 1 from public.orders where transaction_id = v_txn and id <> p_order_id) then
    insert into public.txn_submission_attempts (user_id, order_id, transaction_id_tried, outcome, ip, user_agent)
    values (v_uid, p_order_id, v_txn, 'duplicate', p_ip, p_ua);
    return jsonb_build_object('outcome', 'duplicate', 'order', to_jsonb(v_order));
  end if;

  begin
    update public.orders
    set transaction_id = v_txn, status = 'awaiting_validation', submitted_at = now()
    where id = p_order_id
    returning * into v_order;
  exception when unique_violation then
    -- race with a concurrent submission of the same ID; the block scopes the
    -- rollback so the attempt log below still commits
    insert into public.txn_submission_attempts (user_id, order_id, transaction_id_tried, outcome, ip, user_agent)
    values (v_uid, p_order_id, v_txn, 'duplicate', p_ip, p_ua);
    return jsonb_build_object('outcome', 'duplicate', 'order', null);
  end;

  insert into public.txn_submission_attempts (user_id, order_id, transaction_id_tried, outcome, ip, user_agent)
  values (v_uid, p_order_id, v_txn, 'accepted', p_ip, p_ua);

  perform public._audit(v_uid, 'txn.submitted', 'order', p_order_id,
    jsonb_build_object('ref', v_order.ref, 'transaction_id', v_txn), p_ip, p_ua);

  return jsonb_build_object('outcome', 'accepted', 'order', to_jsonb(v_order));
end $$;

-- ── A6: approve_order ────────────────────────────────────────────────────

create or replace function public.approve_order(p_order_id uuid)
returns public.orders
language plpgsql security definer
set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders%rowtype;
  v_kind public.inventory_kind;
  v_flipped uuid;
  v_account_id uuid;
begin
  if not public.is_admin() then raise exception 'WC_FORBIDDEN'; end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'WC_NOT_FOUND'; end if;
  if v_order.status <> 'awaiting_validation' then raise exception 'WC_BAD_STATUS'; end if;

  update public.orders
  set status = 'paid', validated_by = v_uid, validated_at = now()
  where id = p_order_id;

  if v_order.delivery_type_snapshot = 'manual_action' then
    update public.orders set status = 'fulfilling' where id = p_order_id;
  else
    select inventory_kind into v_kind from public.categories where id = v_order.category_id;

    if v_kind = 'item' then
      update public.inventory_items
      set status = 'delivered', delivered_at = now()
      where order_id = p_order_id and status = 'reserved'
      returning id into v_flipped;

      if v_flipped is not null then
        insert into public.item_reveals (order_id) values (p_order_id) on conflict do nothing;
        update public.orders set status = 'fulfilled', fulfilled_at = now() where id = p_order_id;
      end if;
    else -- slot
      update public.account_slots
      set status = 'active', activated_at = now()
      where order_id = p_order_id and status = 'reserved'
      returning id, shared_account_id into v_flipped, v_account_id;

      if v_flipped is not null then
        update public.shared_accounts sa set status = 'full'
        where sa.id = v_account_id
          and not exists (select 1 from public.account_slots
                          where shared_account_id = sa.id and status = 'free');
        update public.orders set status = 'fulfilled', fulfilled_at = now() where id = p_order_id;
      end if;
    end if;

    if v_flipped is null then
      -- reservation was voided (admin inventory action) — order stays 'paid',
      -- visible on the dashboard as needing retry_fulfillment
      perform public._audit(v_uid, 'order.fulfillment_failed', 'order', p_order_id,
        jsonb_build_object('ref', v_order.ref, 'reason', 'no_reserved_item'));
    end if;
  end if;

  perform public._audit(v_uid, 'payment.approved', 'order', p_order_id,
    jsonb_build_object('ref', v_order.ref, 'transaction_id', v_order.transaction_id,
                       'amount', v_order.amount_expected));

  select * into v_order from public.orders where id = p_order_id;
  return v_order;
end $$;

-- ── A6: reject_order ─────────────────────────────────────────────────────

create or replace function public.reject_order(p_order_id uuid, p_reason text)
returns public.orders
language plpgsql security definer
set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders%rowtype;
begin
  if not public.is_admin() then raise exception 'WC_FORBIDDEN'; end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'WC_NOT_FOUND'; end if;
  if v_order.status <> 'awaiting_validation' then raise exception 'WC_BAD_STATUS'; end if;

  -- transaction_id stays on the order: keeps the uniqueness claim so the same
  -- bad ID cannot be reused elsewhere; resubmission overwrites it.
  update public.orders
  set status = 'rejected', reject_reason = p_reason,
      validated_by = v_uid, validated_at = now()
  where id = p_order_id
  returning * into v_order;

  perform public._audit(v_uid, 'payment.rejected', 'order', p_order_id,
    jsonb_build_object('ref', v_order.ref, 'transaction_id', v_order.transaction_id,
                       'reason', p_reason));
  return v_order;
end $$;

-- ── A6 recovery: retry_fulfillment (order stuck in 'paid') ───────────────

create or replace function public.retry_fulfillment(p_order_id uuid)
returns public.orders
language plpgsql security definer
set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders%rowtype;
  v_kind public.inventory_kind;
  v_service_id uuid;
  v_claimed uuid;
  v_account_id uuid;
begin
  if not public.is_admin() then raise exception 'WC_FORBIDDEN'; end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'WC_NOT_FOUND'; end if;
  if v_order.status <> 'paid' or v_order.delivery_type_snapshot <> 'auto_inventory' then
    raise exception 'WC_BAD_STATUS';
  end if;

  select c.inventory_kind, p.service_id into v_kind, v_service_id
  from public.categories c, public.plans p
  where c.id = v_order.category_id and p.id = v_order.plan_id;

  if v_kind = 'item' then
    update public.inventory_items
    set status = 'delivered', order_id = p_order_id, delivered_at = now()
    where id = (
      select id from public.inventory_items
      where service_id = v_service_id
        and (plan_id = v_order.plan_id or plan_id is null)
        and status = 'available'
      order by plan_id nulls last, created_at
      limit 1 for update skip locked
    ) returning id into v_claimed;
    if v_claimed is not null then
      insert into public.item_reveals (order_id) values (p_order_id) on conflict do nothing;
    end if;
  else
    update public.account_slots
    set status = 'active', order_id = p_order_id, activated_at = now()
    where id = (
      select sl.id from public.account_slots sl
      join public.shared_accounts sa on sa.id = sl.shared_account_id
      where sa.service_id = v_service_id and sa.status = 'active' and sl.status = 'free'
      order by sa.created_at
      limit 1 for update skip locked
    ) returning id, shared_account_id into v_claimed, v_account_id;
    if v_claimed is not null then
      update public.shared_accounts sa set status = 'full'
      where sa.id = v_account_id
        and not exists (select 1 from public.account_slots
                        where shared_account_id = sa.id and status = 'free');
    end if;
  end if;

  if v_claimed is null then raise exception 'WC_OUT_OF_STOCK'; end if;

  update public.orders set status = 'fulfilled', fulfilled_at = now()
  where id = p_order_id returning * into v_order;

  perform public._audit(v_uid, 'order.fulfilled', 'order', p_order_id,
    jsonb_build_object('ref', v_order.ref, 'via', 'retry_fulfillment'));
  return v_order;
end $$;

-- ── A7: complete_manual ──────────────────────────────────────────────────
-- p_encrypted_delivery: AES-256-GCM ciphertext produced by the API route
-- (null for categories with nothing to deliver in-app, e.g. Top-up).

create or replace function public.complete_manual(
  p_order_id uuid,
  p_encrypted_delivery text default null
) returns public.orders
language plpgsql security definer
set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders%rowtype;
begin
  if not public.is_admin() then raise exception 'WC_FORBIDDEN'; end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'WC_NOT_FOUND'; end if;
  if v_order.status <> 'fulfilling' then raise exception 'WC_BAD_STATUS'; end if;

  update public.orders
  set status = 'fulfilled', fulfilled_at = now(), delivery_data = p_encrypted_delivery
  where id = p_order_id
  returning * into v_order;

  if p_encrypted_delivery is not null then
    insert into public.item_reveals (order_id) values (p_order_id) on conflict do nothing;
  end if;

  perform public._audit(v_uid, 'order.fulfilled', 'order', p_order_id,
    jsonb_build_object('ref', v_order.ref, 'via', 'complete_manual',
                       'has_delivery_data', p_encrypted_delivery is not null));
  return v_order;
end $$;

-- ── U6: begin_reveal — one-time reveal, returns CIPHERTEXT ───────────────
-- The API route decrypts; the encryption key never enters the database.

create or replace function public.begin_reveal(
  p_order_id uuid,
  p_ip text default null,
  p_ua text default null
) returns text
language plpgsql security definer
set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders%rowtype;
  v_reveal public.item_reveals%rowtype;
  v_payload text;
begin
  if v_uid is null then raise exception 'WC_UNAUTHENTICATED'; end if;

  select * into v_order from public.orders
  where id = p_order_id and user_id = v_uid and status = 'fulfilled';
  if not found then raise exception 'WC_NOT_FOUND'; end if;

  select * into v_reveal from public.item_reveals where order_id = p_order_id for update;
  if not found then raise exception 'WC_NO_SECRET'; end if;
  if v_reveal.revealed_at is not null then raise exception 'WC_ALREADY_REVEALED'; end if;

  v_payload := coalesce(
    v_order.delivery_data,
    (select encrypted_payload from public.inventory_items
     where order_id = p_order_id and status = 'delivered' limit 1)
  );
  if v_payload is null then raise exception 'WC_NO_SECRET'; end if;

  update public.item_reveals
  set revealed_at = now(), reveal_ip = p_ip, reveal_user_agent = p_ua
  where order_id = p_order_id;

  perform public._audit(v_uid, 'item.revealed', 'order', p_order_id,
    jsonb_build_object('ref', v_order.ref), p_ip, p_ua);

  return v_payload;
end $$;

-- ── S1: expire_orders (pg_cron) ──────────────────────────────────────────

create or replace function public.expire_orders()
returns integer
language plpgsql security definer
set search_path = public as $$
declare
  v_count integer;
begin
  create temporary table _expired on commit drop as
  select id, ref from public.orders
  where status = 'pending_payment' and expires_at < now()
  for update skip locked;

  update public.orders set status = 'expired'
  where id in (select id from _expired);

  update public.inventory_items set status = 'available', order_id = null
  where order_id in (select id from _expired) and status = 'reserved';

  update public.account_slots set status = 'free', order_id = null
  where order_id in (select id from _expired) and status = 'reserved';

  -- accounts that regained a free slot are no longer full
  update public.shared_accounts sa set status = 'active'
  where sa.status = 'full'
    and exists (select 1 from public.account_slots
                where shared_account_id = sa.id and status = 'free');

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  select null, 'order.expired', 'order', id, jsonb_build_object('ref', ref)
  from _expired;

  select count(*) into v_count from _expired;
  return v_count;
end $$;

-- ── grants ───────────────────────────────────────────────────────────────
-- User-facing RPCs: authenticated only. Admin RPCs also 'authenticated' —
-- they enforce is_admin() internally. expire_orders: no client access.

revoke execute on function
  public.create_order, public.submit_txn, public.begin_reveal,
  public.approve_order, public.reject_order, public.retry_fulfillment,
  public.complete_manual, public.expire_orders
from public, anon;

grant execute on function
  public.create_order(uuid, uuid, jsonb),
  public.submit_txn(uuid, text, text, text),
  public.begin_reveal(uuid, text, text),
  public.approve_order(uuid),
  public.reject_order(uuid, text),
  public.retry_fulfillment(uuid),
  public.complete_manual(uuid, text)
to authenticated;
