-- PayPal direct payment: payment_methods.kind + auto-fulfill RPC.
-- PayPal orders skip manual validation: the capture response from PayPal's API
-- is the proof of payment; the capture ID becomes the transaction_id.
-- (Applied to WalanoCastManagement 2026-07-23; see remote for authoritative copy.)

alter table public.payment_methods
  add column kind text not null default 'manual' check (kind in ('manual', 'paypal'));

insert into public.payment_methods (name, kind, instructions, receiving_account, is_active)
values ('PayPal', 'paypal', 'Paiement direct via PayPal.', 'paypal', true);

create or replace function public.paypal_capture_fulfill(
  p_order_id uuid,
  p_capture_id text
) returns public.orders
language plpgsql security definer
set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_kind public.inventory_kind;
  v_flipped uuid;
  v_account_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'WC_NOT_FOUND'; end if;
  if v_order.status <> 'pending_payment' then raise exception 'WC_BAD_STATUS'; end if;

  begin
    update public.orders
    set transaction_id = p_capture_id, submitted_at = now(),
        status = 'paid', validated_at = now()
    where id = p_order_id;
  exception when unique_violation then
    raise exception 'WC_DUPLICATE_TXN';
  end;

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
    else
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
      perform public._audit(null, 'order.fulfillment_failed', 'order', p_order_id,
        jsonb_build_object('ref', v_order.ref, 'reason', 'no_reserved_item', 'via', 'paypal'));
    end if;
  end if;

  perform public._audit(v_order.user_id, 'payment.paypal_captured', 'order', p_order_id,
    jsonb_build_object('ref', v_order.ref, 'capture_id', p_capture_id,
                       'amount', v_order.amount_expected));

  select * into v_order from public.orders where id = p_order_id;
  return v_order;
end $$;

revoke execute on function public.paypal_capture_fulfill from public, anon, authenticated;
grant execute on function public.paypal_capture_fulfill(uuid, text) to service_role;
