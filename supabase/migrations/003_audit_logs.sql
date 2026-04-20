-- Logs d'audit pour traçabilité des actions importantes

create type audit_action as enum (
  'user_role_changed',
  'request_created',
  'request_status_changed',
  'subscription_fulfilled',
  'subscription_rejected',
  'admin_login',
  'system_backup'
);

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  action      audit_action not null,
  actor_id    uuid references auth.users(id) on delete set null,
  target_id   text,          -- ID de la ressource concernée (user_id, request_id, etc.)
  target_type text,          -- Type : 'user', 'manual_request', 'sale', etc.
  metadata    jsonb,         -- Données additionnelles (ancien état, nouveau état, etc.)
  created_at  timestamptz not null default now()
);

-- Index
create index idx_audit_logs_actor on public.audit_logs(actor_id);
create index idx_audit_logs_action on public.audit_logs(action);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index idx_audit_logs_target on public.audit_logs(target_id, target_type);

-- RLS
alter table public.audit_logs enable row level security;

-- Seul system_admin voit les logs
create policy "system_admin sees audit logs"
  on public.audit_logs for select
  using (
    public.get_user_role(auth.uid()) = 'system_admin'
  );

-- Insert uniquement via le backend (service role) — pas de policy insert pour les users
-- Le backend utilise la service role key pour écrire les logs
