-- WalanoCast — Row Level Security
-- Spec §5: users see own data + active catalog; inventory/audit tables have
-- ZERO client access (server routes with service role only).

-- ── profiles ─────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- role column is not editable by users: column-level privileges.
revoke update on public.profiles from authenticated;
grant update (display_name, phone) on public.profiles to authenticated;

-- ── catalog: public read of active rows, admin reads all ─────────────────

alter table public.categories enable row level security;
create policy "categories: public read active" on public.categories
  for select using (is_active or public.is_admin());

alter table public.services enable row level security;
create policy "services: public read active" on public.services
  for select using (is_active or public.is_admin());

alter table public.plans enable row level security;
create policy "plans: public read active" on public.plans
  for select using (is_active or public.is_admin());

alter table public.payment_methods enable row level security;
create policy "payment_methods: public read active" on public.payment_methods
  for select using (is_active or public.is_admin());

-- Catalog writes: none from clients — admin CRUD goes through server routes
-- using the service role (bypasses RLS).

-- ── orders: users read their own, admin reads all; writes via RPC only ───

alter table public.orders enable row level security;

create policy "orders: read own" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

-- No insert/update/delete policies: all mutations go through security-definer
-- RPCs (create_order, submit_txn, approve_order, …).

-- ── zero-client-access tables ────────────────────────────────────────────
-- RLS on, no policies → anon/authenticated see nothing. Service role bypasses.

alter table public.inventory_items enable row level security;
alter table public.shared_accounts enable row level security;
alter table public.account_slots enable row level security;
alter table public.item_reveals enable row level security;
alter table public.audit_logs enable row level security;
alter table public.txn_submission_attempts enable row level security;

-- Belt and braces: even service-role sessions cannot UPDATE/DELETE audit rows
-- (append-only). Supabase service role has BYPASSRLS but not superuser, so
-- revoking the privileges holds.
revoke update, delete on public.audit_logs from anon, authenticated, service_role;

-- ── public stock counts (spec U2) ────────────────────────────────────────
-- Raw inventory stays hidden; only aggregate counts are exposed.

create or replace function public.get_stock_counts()
returns table (service_id uuid, available bigint)
language sql security definer stable
set search_path = public as $$
  select s.id as service_id,
         case c.inventory_kind
           when 'none' then 1::bigint  -- manual categories: always orderable
           when 'item' then (
             select count(*) from public.inventory_items i
             where i.service_id = s.id and i.status = 'available'
           )
           when 'slot' then (
             select count(*) from public.account_slots sl
             join public.shared_accounts sa on sa.id = sl.shared_account_id
             where sa.service_id = s.id and sa.status = 'active' and sl.status = 'free'
           )
         end as available
  from public.services s
  join public.categories c on c.id = s.category_id
  where s.is_active and c.is_active;
$$;

grant execute on function public.get_stock_counts() to anon, authenticated;
