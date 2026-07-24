-- Notes utilisateurs par produit (clé = product_id + user_id).
-- Un utilisateur ne peut noter qu'une fois un produit (PK composite).
-- Aggregate (AVG, COUNT) reste calculable côté lecture ; affichage statique
-- pour l'instant (cf. front).

create table public.product_ratings (
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  text not null,
  stars       int  not null check (stars between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index idx_product_ratings_product on public.product_ratings(product_id);

create trigger product_ratings_updated_at
  before update on public.product_ratings
  for each row execute function public.set_updated_at();

alter table public.product_ratings enable row level security;

-- Lecture publique : tout le monde peut voir les notes (agrégat + commentaires)
create policy "ratings_select_all"
  on public.product_ratings for select
  using (true);

-- Insertion : seul le user connecté peut créer SA propre note
create policy "ratings_insert_own"
  on public.product_ratings for insert
  with check (auth.uid() = user_id);

-- Mise à jour : seul le propriétaire peut modifier
create policy "ratings_update_own"
  on public.product_ratings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Suppression : seul le propriétaire
create policy "ratings_delete_own"
  on public.product_ratings for delete
  using (auth.uid() = user_id);
