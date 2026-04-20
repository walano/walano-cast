-- Per-service checkout fields override (e.g. Netflix PIN = 4 digits,
-- Prime Video PIN = 5). NULL = inherit the category's checkout_fields.

alter table public.services add column checkout_fields_override jsonb;
