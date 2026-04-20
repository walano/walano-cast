-- WalanoCast subscription platform — core schema
-- Spec: walano-cast-backend-spec.md §3

-- ── Enums ────────────────────────────────────────────────────────────────

create type public.delivery_type as enum ('auto_inventory', 'manual_action');
create type public.inventory_kind as enum ('item', 'slot', 'none');
create type public.inventory_item_status as enum ('available', 'reserved', 'delivered', 'void');
create type public.shared_account_status as enum ('active', 'full', 'retired');
create type public.slot_status as enum ('free', 'reserved', 'active', 'retired');
create type public.order_status as enum (
  'pending_payment', 'awaiting_validation', 'paid',
  'fulfilling', 'fulfilled', 'rejected', 'expired'
);
create type public.user_role as enum ('user', 'admin');

-- ── Helpers ──────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── profiles (1:1 auth.users) ────────────────────────────────────────────

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone        text,
  role         public.user_role not null default 'user',
  created_at   timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── categories ───────────────────────────────────────────────────────────

create table public.categories (
  id                        uuid primary key default gen_random_uuid(),
  name                      text not null,
  slug                      text not null unique,
  description               text,
  checkout_fields           jsonb not null default '[]'::jsonb,
  delivery_type             public.delivery_type not null,
  inventory_kind            public.inventory_kind not null,
  post_payment_instructions text,
  is_active                 boolean not null default true,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint categories_kind_matches_delivery check (
    (delivery_type = 'manual_action' and inventory_kind = 'none') or
    (delivery_type = 'auto_inventory' and inventory_kind in ('item', 'slot'))
  )
);

create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ── services ─────────────────────────────────────────────────────────────

create table public.services (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  name        text not null,
  slug        text not null unique,
  description text,
  logo_url    text,
  cover_url   text,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_services_category on public.services(category_id);

create trigger services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ── plans ────────────────────────────────────────────────────────────────

create table public.plans (
  id             uuid primary key default gen_random_uuid(),
  service_id     uuid not null references public.services(id),
  label          text not null,
  duration_days  integer not null check (duration_days > 0),
  price_amount   numeric(12,2) not null check (price_amount >= 0),
  price_currency text not null default 'XAF',
  details        text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_plans_service on public.plans(service_id);

create trigger plans_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- ── payment_methods ──────────────────────────────────────────────────────

create table public.payment_methods (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  instructions      text not null,
  receiving_account text not null,
  txn_id_pattern    text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger payment_methods_updated_at
  before update on public.payment_methods
  for each row execute function public.set_updated_at();

-- ── orders ───────────────────────────────────────────────────────────────

create table public.orders (
  id                     uuid primary key default gen_random_uuid(),
  ref                    text not null unique,
  user_id                uuid not null references public.profiles(id),
  plan_id                uuid not null references public.plans(id),
  category_id            uuid not null references public.categories(id),
  delivery_type_snapshot public.delivery_type not null,
  checkout_data          jsonb not null default '{}'::jsonb,
  amount_expected        numeric(12,2) not null,
  currency               text not null default 'XAF',
  payment_method_id      uuid not null references public.payment_methods(id),
  transaction_id         text,
  status                 public.order_status not null default 'pending_payment',
  -- AES-256-GCM ciphertext of manual delivery data (Compte personnel password, …)
  delivery_data          text,
  reject_reason          text,
  validated_by           uuid references public.profiles(id),
  submitted_at           timestamptz,
  validated_at           timestamptz,
  fulfilled_at           timestamptz,
  expires_at             timestamptz not null,
  created_at             timestamptz not null default now()
);

-- Anti-replay: one transaction ID, one order, forever (spec §5)
create unique index idx_orders_txn_unique on public.orders(transaction_id)
  where transaction_id is not null;

create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_pending_expiry on public.orders(expires_at)
  where status = 'pending_payment';

create or replace function public.gen_order_ref()
returns text language plpgsql volatile
set search_path = public as $$
declare
  -- no 0/O/1/I/L to avoid transcription mistakes in WhatsApp messages
  chars constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_ref text;
begin
  loop
    v_ref := 'WC-';
    for i in 1..5 loop
      v_ref := v_ref || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.orders where ref = v_ref);
  end loop;
  return v_ref;
end $$;

alter table public.orders alter column ref set default public.gen_order_ref();

-- ── inventory_items (keys / invite links / credential sets) ──────────────

create table public.inventory_items (
  id                uuid primary key default gen_random_uuid(),
  service_id        uuid not null references public.services(id),
  plan_id           uuid references public.plans(id),
  -- AES-256-GCM ciphertext; plaintext never stored
  encrypted_payload text not null,
  status            public.inventory_item_status not null default 'available',
  order_id          uuid references public.orders(id),
  created_at        timestamptz not null default now(),
  delivered_at      timestamptz
);

create index idx_inventory_service_status on public.inventory_items(service_id, status);
create index idx_inventory_order on public.inventory_items(order_id) where order_id is not null;

-- ── shared_accounts + account_slots (Profil mode) ────────────────────────

create table public.shared_accounts (
  id            uuid primary key default gen_random_uuid(),
  service_id    uuid not null references public.services(id),
  account_email text not null,
  capacity      integer not null check (capacity > 0),
  status        public.shared_account_status not null default 'active',
  expires_at    date,
  created_at    timestamptz not null default now()
);

create index idx_shared_accounts_service on public.shared_accounts(service_id, status);

create table public.account_slots (
  id                uuid primary key default gen_random_uuid(),
  shared_account_id uuid not null references public.shared_accounts(id) on delete cascade,
  order_id          uuid references public.orders(id),
  status            public.slot_status not null default 'free',
  activated_at      timestamptz
);

create index idx_slots_account_status on public.account_slots(shared_account_id, status);
create index idx_slots_order on public.account_slots(order_id) where order_id is not null;

-- capacity N → N free slots, automatically
create or replace function public.create_slots_for_account()
returns trigger language plpgsql
set search_path = public as $$
begin
  insert into public.account_slots (shared_account_id)
  select new.id from generate_series(1, new.capacity);
  return new;
end $$;

create trigger on_shared_account_created
  after insert on public.shared_accounts
  for each row execute function public.create_slots_for_account();

-- ── item_reveals (one-time reveal guard) ─────────────────────────────────

create table public.item_reveals (
  order_id          uuid primary key references public.orders(id),
  revealed_at       timestamptz,
  reveal_ip         text,
  reveal_user_agent text
);

-- ── audit_logs (append-only) ─────────────────────────────────────────────

create table public.audit_logs (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  details     jsonb not null default '{}'::jsonb,
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index idx_audit_action on public.audit_logs(action);
create index idx_audit_created on public.audit_logs(created_at);

-- ── txn_submission_attempts (rate limiting + fraud trail) ────────────────

create table public.txn_submission_attempts (
  id                   bigint generated always as identity primary key,
  user_id              uuid not null,
  order_id             uuid,
  transaction_id_tried text,
  outcome              text not null,
  ip                   text,
  user_agent           text,
  created_at           timestamptz not null default now()
);

create index idx_txn_attempts_user_time on public.txn_submission_attempts(user_id, created_at);

-- ── backfill: existing auth users → profiles, both are the owner's admin accounts

insert into public.profiles (id, role)
select id, 'admin'::public.user_role from auth.users
on conflict (id) do nothing;
