-- Détails enrichis par produit (clé = product_id).
-- Contenu app-spécifique : description longue + processus d'activation.

create table public.product_details (
  product_id  text primary key,            -- ID du produit
  details     text,                        -- description riche (markdown/texte)
  activation  text,                        -- processus d'activation
  updated_at  timestamptz not null default now()
);

create trigger product_details_updated_at
  before update on public.product_details
  for each row execute function public.set_updated_at();

alter table public.product_details enable row level security;

-- Lecture publique (affichée sur la page service)
create policy "public read product_details"
  on public.product_details for select
  using (true);

-- Écriture réservée aux admins
create policy "admin write product_details"
  on public.product_details for all
  using (public.get_user_role(auth.uid()) in ('app_admin', 'system_admin'))
  with check (public.get_user_role(auth.uid()) in ('app_admin', 'system_admin'));
