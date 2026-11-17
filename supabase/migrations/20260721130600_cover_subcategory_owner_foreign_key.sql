create index subcategories_category_owner_idx
  on public.subcategories (category_id, user_id);
