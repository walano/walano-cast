-- Demandes de subscriptions manuelles
-- Quand un customer demande une subscription qui nécessite traitement admin

create type request_status as enum (
  'pending',
  'in_progress',
  'fulfilled',
  'rejected'
);

create table public.manual_requests (
  id                uuid primary key default gen_random_uuid(),
  -- Identité du customer
  customer_user_id  uuid references auth.users(id) on delete set null,
  customer_email    text not null,
  customer_name     text,
  customer_whatsapp text,
  -- Subscription demandée
  product_id        text not null,   -- ID du produit
  product_name      text not null,   -- Nom au moment de la demande
  quantity          int not null default 1,
  -- Traitement admin
  status            request_status not null default 'pending',
  admin_user_id     uuid references auth.users(id) on delete set null,
  admin_notes       text,
  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  fulfilled_at      timestamptz
);

-- Index
create index idx_manual_requests_customer on public.manual_requests(customer_user_id);
create index idx_manual_requests_status on public.manual_requests(status);
create index idx_manual_requests_created_at on public.manual_requests(created_at desc);

-- Updated_at trigger
create trigger manual_requests_updated_at
  before update on public.manual_requests
  for each row execute function public.set_updated_at();

-- RLS
alter table public.manual_requests enable row level security;

-- Customer voit uniquement ses propres demandes
create policy "customer sees own requests"
  on public.manual_requests for select
  using (
    auth.uid() = customer_user_id
  );

-- Customer peut créer une demande
create policy "customer can create request"
  on public.manual_requests for insert
  with check (
    auth.uid() = customer_user_id
    and customer_user_id is not null
  );

-- app_admin et system_admin voient tout et peuvent modifier
create policy "admin manages all requests"
  on public.manual_requests for all
  using (
    public.get_user_role(auth.uid()) in ('app_admin', 'system_admin')
  );
