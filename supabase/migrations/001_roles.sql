-- Rôles utilisateurs Walano Cast
-- Dépend de auth.users (Supabase Auth)

create type user_role as enum (
  'customer',
  'app_admin',
  'finance_admin',
  'system_admin'
);

create table public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint user_roles_user_id_unique unique (user_id)
);

-- Index
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_roles_updated_at
  before update on public.user_roles
  for each row execute function public.set_updated_at();

-- RLS
alter table public.user_roles enable row level security;

-- Un user voit uniquement son propre rôle
create policy "user sees own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Seul system_admin peut modifier les rôles
create policy "system_admin manages roles"
  on public.user_roles for all
  using (
    exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid()
      and r.role = 'system_admin'
    )
  );

-- Fonction helper pour vérifier le rôle (utilisée dans les autres policies)
create or replace function public.get_user_role(uid uuid)
returns user_role language sql security definer stable as $$
  select role from public.user_roles where user_id = uid;
$$;

-- Insérer automatiquement un rôle 'customer' à la création d'un user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
