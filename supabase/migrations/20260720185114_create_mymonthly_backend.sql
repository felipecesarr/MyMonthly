create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  whatsapp text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bank_accounts (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bank_name text not null,
  bank_icon text not null default '',
  agency_number text not null default '',
  account_number_last4 text not null default '',
  account_type text not null default 'checking',
  balance numeric(14, 2) not null default 0,
  total_inflow numeric(14, 2) not null default 0 check (total_inflow >= 0),
  total_outflow numeric(14, 2) not null default 0 check (total_outflow >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bank_accounts_number_last4_format
    check (account_number_last4 = '' or account_number_last4 ~ '^[0-9]{1,4}$')
);

create table public.credit_cards (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bank_name text not null,
  bank_icon text not null default '',
  card_last4 text not null,
  expiry_month smallint check (expiry_month between 1 and 12),
  expiry_year smallint check (expiry_year between 2020 and 2200),
  credit_limit numeric(14, 2) not null default 0 check (credit_limit >= 0),
  current_spend numeric(14, 2) not null default 0 check (current_spend >= 0),
  total_inflow numeric(14, 2) not null default 0 check (total_inflow >= 0),
  total_outflow numeric(14, 2) not null default 0 check (total_outflow >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credit_cards_last4_format check (card_last4 ~ '^[0-9]{4}$')
);

create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('expense', 'income')),
  name text not null,
  emoji text not null default '',
  primary_color text not null default '#64748B',
  secondary_color text not null default '#E2E8F0',
  bold_color text not null default '#334155',
  budget numeric(14, 2) not null default 0 check (budget >= 0),
  spent_amount numeric(14, 2) not null default 0 check (spent_amount >= 0),
  income_amount numeric(14, 2) not null default 0 check (income_amount >= 0),
  is_default boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, kind, name)
);

create table public.subcategories (
  id uuid primary key default extensions.gen_random_uuid(),
  category_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '',
  primary_color text not null default '#64748B',
  secondary_color text not null default '#E2E8F0',
  bold_color text not null default '#334155',
  budget numeric(14, 2) not null default 0 check (budget >= 0),
  spent_amount numeric(14, 2) not null default 0 check (spent_amount >= 0),
  income_amount numeric(14, 2) not null default 0 check (income_amount >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subcategories_category_owner_fkey
    foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete cascade,
  unique (category_id, name)
);

create table public.transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'transfer', 'card_payment')),
  direction text check (direction is null or direction in ('in', 'out')),
  transfer_group_id uuid,
  name text not null,
  description text not null default '',
  amount numeric(14, 2) not null check (amount > 0),
  occurred_at timestamptz not null,
  payment_type text check (payment_type is null or payment_type in ('account', 'card')),
  account_id uuid references public.bank_accounts(id) on delete restrict,
  credit_card_id uuid references public.credit_cards(id) on delete restrict,
  source_account_id uuid references public.bank_accounts(id) on delete restrict,
  destination_account_id uuid references public.bank_accounts(id) on delete restrict,
  destination_card_id uuid references public.credit_cards(id) on delete restrict,
  category_id uuid references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_payment_target_check check (
    (payment_type = 'account' and account_id is not null and credit_card_id is null)
    or (payment_type = 'card' and credit_card_id is not null and account_id is null)
    or payment_type is null
  )
);

comment on column public.bank_accounts.account_number_last4 is
  'Only the final four digits are stored. Never store complete bank account numbers in the mobile backend.';
comment on column public.credit_cards.card_last4 is
  'Only the final four digits are stored. Full PAN data is intentionally prohibited.';

create index bank_accounts_user_active_idx
  on public.bank_accounts (user_id, created_at)
  where archived_at is null;
create index credit_cards_user_active_idx
  on public.credit_cards (user_id, created_at)
  where archived_at is null;
create index categories_user_kind_active_idx
  on public.categories (user_id, kind, created_at)
  where archived_at is null;
create index subcategories_category_active_idx
  on public.subcategories (category_id, created_at)
  where archived_at is null;
create index subcategories_user_id_idx on public.subcategories (user_id);
create index transactions_user_occurred_idx
  on public.transactions (user_id, occurred_at desc);
create index transactions_user_type_occurred_idx
  on public.transactions (user_id, type, occurred_at desc);
create index transactions_group_idx
  on public.transactions (transfer_group_id)
  where transfer_group_id is not null;
create index transactions_account_id_idx on public.transactions (account_id);
create index transactions_credit_card_id_idx on public.transactions (credit_card_id);
create index transactions_source_account_id_idx on public.transactions (source_account_id);
create index transactions_destination_account_id_idx on public.transactions (destination_account_id);
create index transactions_destination_card_id_idx on public.transactions (destination_card_id);
create index transactions_category_id_idx on public.transactions (category_id);
create index transactions_subcategory_id_idx on public.transactions (subcategory_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();
create trigger bank_accounts_set_updated_at
before update on public.bank_accounts
for each row execute function private.set_updated_at();
create trigger credit_cards_set_updated_at
before update on public.credit_cards
for each row execute function private.set_updated_at();
create trigger categories_set_updated_at
before update on public.categories
for each row execute function private.set_updated_at();
create trigger subcategories_set_updated_at
before update on public.subcategories
for each row execute function private.set_updated_at();
create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, whatsapp)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'user_name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'whatsapp', '')
  );

  insert into public.categories (
    user_id, kind, name, emoji, primary_color, secondary_color, bold_color, is_default
  )
  values
    (new.id, 'expense', 'Moradia', '🏠', '#A87EFA', '#A87EFA30', '#820AD1', true),
    (new.id, 'expense', 'Alimentação', '🍽️', '#FF865A', '#FF865A30', '#FF5B20', true),
    (new.id, 'expense', 'Saúde', '🏋🏻', '#FD6FAF', '#FD6FAF30', '#FF2688', true),
    (new.id, 'expense', 'Lazer', '🛍️', '#7BCBE8', '#7BCBE830', '#1599D1', true),
    (new.id, 'expense', 'Pet', '🐶', '#73DBC9', '#73DBC930', '#24C2A6', true),
    (new.id, 'expense', 'Metas', '🎯', '#FFAD3A', '#FFAD3A30', '#FF9500', true),
    (new.id, 'expense', 'Transporte', '🚙', '#FC6060', '#FC606030', '#F62929', true),
    (new.id, 'expense', 'Investimento', '📈', '#6B83F0', '#6B83F030', '#3E5FF3', true),
    (new.id, 'expense', 'Educação', '📚', '#B4CA75', '#B4CA7530', '#8AB21E', true),
    (new.id, 'expense', 'Outros', '🪙', '#A47456', '#A4745630', '#644537', true),
    (new.id, 'income', 'Receitas', '💼', '#0CC0DF', '#0CC0DF30', '#0097B2', true);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.credit_cards enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.transactions enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy bank_accounts_select_own on public.bank_accounts
for select to authenticated
using ((select auth.uid()) = user_id);
create policy bank_accounts_insert_own on public.bank_accounts
for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy bank_accounts_update_own on public.bank_accounts
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy bank_accounts_delete_own on public.bank_accounts
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy credit_cards_select_own on public.credit_cards
for select to authenticated
using ((select auth.uid()) = user_id);
create policy credit_cards_insert_own on public.credit_cards
for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy credit_cards_update_own on public.credit_cards
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy credit_cards_delete_own on public.credit_cards
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy categories_select_own on public.categories
for select to authenticated
using ((select auth.uid()) = user_id);
create policy categories_insert_own on public.categories
for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy categories_update_own on public.categories
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy categories_delete_own on public.categories
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy subcategories_select_own on public.subcategories
for select to authenticated
using ((select auth.uid()) = user_id);
create policy subcategories_insert_own on public.subcategories
for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy subcategories_update_own on public.subcategories
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
create policy subcategories_delete_own on public.subcategories
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy transactions_select_own on public.transactions
for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.profiles from anon, authenticated;
revoke all on public.bank_accounts from anon, authenticated;
revoke all on public.credit_cards from anon, authenticated;
revoke all on public.categories from anon, authenticated;
revoke all on public.subcategories from anon, authenticated;
revoke all on public.transactions from anon, authenticated;

grant select, update (full_name, whatsapp) on public.profiles to authenticated;
grant select on public.bank_accounts to authenticated;
grant insert (
  user_id, bank_name, bank_icon, agency_number, account_number_last4, account_type, balance
) on public.bank_accounts to authenticated;
grant update (
  bank_name, bank_icon, agency_number, account_number_last4, account_type, archived_at
) on public.bank_accounts to authenticated;
grant select on public.credit_cards to authenticated;
grant insert (
  user_id, bank_name, bank_icon, card_last4, expiry_month, expiry_year, credit_limit
) on public.credit_cards to authenticated;
grant update (
  bank_name, bank_icon, card_last4, expiry_month, expiry_year, credit_limit, archived_at
) on public.credit_cards to authenticated;
grant select on public.categories to authenticated;
grant insert (
  user_id, kind, name, emoji, primary_color, secondary_color, bold_color, budget
) on public.categories to authenticated;
grant update (
  name, emoji, primary_color, secondary_color, bold_color, budget, archived_at
) on public.categories to authenticated;
grant select on public.subcategories to authenticated;
grant insert (
  category_id, user_id, name, emoji, primary_color, secondary_color, bold_color, budget
) on public.subcategories to authenticated;
grant update (
  name, emoji, primary_color, secondary_color, bold_color, budget, archived_at
) on public.subcategories to authenticated;
grant select on public.transactions to authenticated;

create or replace function public.create_income_transaction(
  p_name text,
  p_description text,
  p_amount numeric,
  p_occurred_at timestamptz,
  p_payment_type text,
  p_account_id uuid,
  p_credit_card_id uuid,
  p_category_id uuid,
  p_subcategory_id uuid
)
returns public.transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_transaction public.transactions;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then raise exception 'name is required'; end if;
  if p_occurred_at is null then raise exception 'occurred_at is required'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if p_payment_type not in ('account', 'card') then raise exception 'invalid payment type'; end if;
  if not exists (
    select 1 from public.subcategories s
    join public.categories c on c.id = s.category_id
    where s.id = p_subcategory_id and s.category_id = p_category_id
      and s.user_id = v_user_id and c.user_id = v_user_id and c.kind = 'income'
      and s.archived_at is null and c.archived_at is null
  ) then raise exception 'invalid income category'; end if;

  if p_payment_type = 'account' then
    if not exists (select 1 from public.bank_accounts where id = p_account_id and user_id = v_user_id and archived_at is null)
      then raise exception 'invalid account'; end if;
    update public.bank_accounts
      set balance = balance + p_amount, total_inflow = total_inflow + p_amount
      where id = p_account_id and user_id = v_user_id;
  else
    if not exists (select 1 from public.credit_cards where id = p_credit_card_id and user_id = v_user_id and archived_at is null)
      then raise exception 'invalid card'; end if;
    update public.credit_cards
      set total_inflow = total_inflow + p_amount
      where id = p_credit_card_id and user_id = v_user_id;
  end if;

  update public.subcategories set income_amount = income_amount + p_amount
    where id = p_subcategory_id and user_id = v_user_id;
  update public.categories set income_amount = income_amount + p_amount
    where id = p_category_id and user_id = v_user_id;

  insert into public.transactions (
    user_id, type, name, description, amount, occurred_at, payment_type,
    account_id, credit_card_id, category_id, subcategory_id
  ) values (
    v_user_id, 'income', trim(p_name), coalesce(p_description, ''), p_amount,
    p_occurred_at, p_payment_type,
    case when p_payment_type = 'account' then p_account_id end,
    case when p_payment_type = 'card' then p_credit_card_id end,
    p_category_id, p_subcategory_id
  ) returning * into v_transaction;
  return v_transaction;
end;
$$;

create or replace function public.create_expense_transaction(
  p_name text,
  p_description text,
  p_amount numeric,
  p_occurred_at timestamptz,
  p_payment_type text,
  p_account_id uuid,
  p_credit_card_id uuid,
  p_category_id uuid,
  p_subcategory_id uuid
)
returns public.transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_transaction public.transactions;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then raise exception 'name is required'; end if;
  if p_occurred_at is null then raise exception 'occurred_at is required'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if p_payment_type not in ('account', 'card') then raise exception 'invalid payment type'; end if;
  if not exists (
    select 1 from public.subcategories s
    join public.categories c on c.id = s.category_id
    where s.id = p_subcategory_id and s.category_id = p_category_id
      and s.user_id = v_user_id and c.user_id = v_user_id and c.kind = 'expense'
      and s.archived_at is null and c.archived_at is null
  ) then raise exception 'invalid expense category'; end if;

  if p_payment_type = 'account' then
    if not exists (select 1 from public.bank_accounts where id = p_account_id and user_id = v_user_id and archived_at is null)
      then raise exception 'invalid account'; end if;
    update public.bank_accounts
      set balance = balance - p_amount, total_outflow = total_outflow + p_amount
      where id = p_account_id and user_id = v_user_id;
  else
    if not exists (select 1 from public.credit_cards where id = p_credit_card_id and user_id = v_user_id and archived_at is null)
      then raise exception 'invalid card'; end if;
    update public.credit_cards
      set current_spend = current_spend + p_amount, total_outflow = total_outflow + p_amount
      where id = p_credit_card_id and user_id = v_user_id;
  end if;

  update public.subcategories set spent_amount = spent_amount + p_amount
    where id = p_subcategory_id and user_id = v_user_id;
  update public.categories set spent_amount = spent_amount + p_amount
    where id = p_category_id and user_id = v_user_id;

  insert into public.transactions (
    user_id, type, name, description, amount, occurred_at, payment_type,
    account_id, credit_card_id, category_id, subcategory_id
  ) values (
    v_user_id, 'expense', trim(p_name), coalesce(p_description, ''), p_amount,
    p_occurred_at, p_payment_type,
    case when p_payment_type = 'account' then p_account_id end,
    case when p_payment_type = 'card' then p_credit_card_id end,
    p_category_id, p_subcategory_id
  ) returning * into v_transaction;
  return v_transaction;
end;
$$;

create or replace function public.create_transfer(
  p_name text,
  p_description text,
  p_amount numeric,
  p_occurred_at timestamptz,
  p_source_account_id uuid,
  p_destination_type text,
  p_destination_account_id uuid,
  p_destination_card_id uuid
)
returns setof public.transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_group_id uuid := extensions.gen_random_uuid();
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then raise exception 'name is required'; end if;
  if p_occurred_at is null then raise exception 'occurred_at is required'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if p_destination_type not in ('account', 'card') then raise exception 'invalid destination type'; end if;
  if not exists (select 1 from public.bank_accounts where id = p_source_account_id and user_id = v_user_id and archived_at is null)
    then raise exception 'invalid source account'; end if;

  update public.bank_accounts set balance = balance - p_amount
    where id = p_source_account_id and user_id = v_user_id;

  if p_destination_type = 'account' then
    if p_destination_account_id = p_source_account_id then raise exception 'source and destination must differ'; end if;
    if not exists (select 1 from public.bank_accounts where id = p_destination_account_id and user_id = v_user_id and archived_at is null)
      then raise exception 'invalid destination account'; end if;
    update public.bank_accounts set balance = balance + p_amount
      where id = p_destination_account_id and user_id = v_user_id;
  else
    if not exists (
      select 1 from public.credit_cards
      where id = p_destination_card_id and user_id = v_user_id
        and archived_at is null and current_spend >= p_amount
    )
      then raise exception 'invalid destination card'; end if;
    update public.credit_cards set current_spend = current_spend - p_amount
      where id = p_destination_card_id and user_id = v_user_id;
  end if;

  insert into public.transactions (
    user_id, type, direction, transfer_group_id, name, description, amount,
    occurred_at, source_account_id, destination_account_id, destination_card_id
  ) values
    (v_user_id, 'transfer', 'out', v_group_id, trim(p_name), coalesce(p_description, ''),
      p_amount, p_occurred_at, p_source_account_id,
      case when p_destination_type = 'account' then p_destination_account_id end,
      case when p_destination_type = 'card' then p_destination_card_id end),
    (v_user_id, 'transfer', 'in', v_group_id, trim(p_name), coalesce(p_description, ''),
      p_amount, p_occurred_at, p_source_account_id,
      case when p_destination_type = 'account' then p_destination_account_id end,
      case when p_destination_type = 'card' then p_destination_card_id end);

  return query select * from public.transactions where transfer_group_id = v_group_id order by direction desc;
end;
$$;

create or replace function public.create_card_payment(
  p_name text,
  p_description text,
  p_amount numeric,
  p_occurred_at timestamptz,
  p_source_account_id uuid,
  p_destination_card_id uuid
)
returns setof public.transactions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_group_id uuid := extensions.gen_random_uuid();
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if nullif(trim(coalesce(p_name, '')), '') is null then raise exception 'name is required'; end if;
  if p_occurred_at is null then raise exception 'occurred_at is required'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if not exists (select 1 from public.bank_accounts where id = p_source_account_id and user_id = v_user_id and archived_at is null)
    then raise exception 'invalid source account'; end if;
  if not exists (
    select 1 from public.credit_cards
    where id = p_destination_card_id and user_id = v_user_id
      and archived_at is null and current_spend >= p_amount
  )
    then raise exception 'invalid destination card'; end if;

  update public.bank_accounts
    set balance = balance - p_amount, total_outflow = total_outflow + p_amount
    where id = p_source_account_id and user_id = v_user_id;
  update public.credit_cards
    set current_spend = current_spend - p_amount,
        total_outflow = greatest(0, total_outflow - p_amount)
    where id = p_destination_card_id and user_id = v_user_id;

  insert into public.transactions (
    user_id, type, direction, transfer_group_id, name, description, amount,
    occurred_at, source_account_id, destination_card_id
  ) values
    (v_user_id, 'card_payment', 'out', v_group_id, trim(p_name), coalesce(p_description, ''),
      p_amount, p_occurred_at, p_source_account_id, p_destination_card_id),
    (v_user_id, 'card_payment', 'in', v_group_id, trim(p_name), coalesce(p_description, ''),
      p_amount, p_occurred_at, p_source_account_id, p_destination_card_id);

  return query select * from public.transactions where transfer_group_id = v_group_id order by direction desc;
end;
$$;

create or replace function public.delete_financial_transaction(p_transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_tx public.transactions;
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  select * into v_tx from public.transactions
    where id = p_transaction_id and user_id = v_user_id
    for update;
  if not found then raise exception 'transaction not found'; end if;

  if v_tx.type = 'expense' then
    if v_tx.payment_type = 'account' then
      update public.bank_accounts
        set balance = balance + v_tx.amount,
            total_outflow = greatest(0, total_outflow - v_tx.amount)
        where id = v_tx.account_id and user_id = v_user_id;
    else
      update public.credit_cards
        set current_spend = greatest(0, current_spend - v_tx.amount),
            total_outflow = greatest(0, total_outflow - v_tx.amount)
        where id = v_tx.credit_card_id and user_id = v_user_id;
    end if;
    update public.subcategories set spent_amount = greatest(0, spent_amount - v_tx.amount)
      where id = v_tx.subcategory_id and user_id = v_user_id;
    update public.categories set spent_amount = greatest(0, spent_amount - v_tx.amount)
      where id = v_tx.category_id and user_id = v_user_id;
  elsif v_tx.type = 'income' then
    if v_tx.payment_type = 'account' then
      update public.bank_accounts
        set balance = balance - v_tx.amount,
            total_inflow = greatest(0, total_inflow - v_tx.amount)
        where id = v_tx.account_id and user_id = v_user_id;
    else
      update public.credit_cards set total_inflow = greatest(0, total_inflow - v_tx.amount)
        where id = v_tx.credit_card_id and user_id = v_user_id;
    end if;
    update public.subcategories set income_amount = greatest(0, income_amount - v_tx.amount)
      where id = v_tx.subcategory_id and user_id = v_user_id;
    update public.categories set income_amount = greatest(0, income_amount - v_tx.amount)
      where id = v_tx.category_id and user_id = v_user_id;
  elsif v_tx.type = 'transfer' then
    update public.bank_accounts set balance = balance + v_tx.amount
      where id = v_tx.source_account_id and user_id = v_user_id;
    if v_tx.destination_account_id is not null then
      update public.bank_accounts set balance = balance - v_tx.amount
        where id = v_tx.destination_account_id and user_id = v_user_id;
    else
      update public.credit_cards set current_spend = current_spend + v_tx.amount
        where id = v_tx.destination_card_id and user_id = v_user_id;
    end if;
  elsif v_tx.type = 'card_payment' then
    update public.bank_accounts
      set balance = balance + v_tx.amount,
          total_outflow = greatest(0, total_outflow - v_tx.amount)
      where id = v_tx.source_account_id and user_id = v_user_id;
    update public.credit_cards
      set current_spend = current_spend + v_tx.amount,
          total_outflow = total_outflow + v_tx.amount
      where id = v_tx.destination_card_id and user_id = v_user_id;
  end if;

  if v_tx.transfer_group_id is not null then
    delete from public.transactions
      where transfer_group_id = v_tx.transfer_group_id and user_id = v_user_id;
  else
    delete from public.transactions where id = v_tx.id and user_id = v_user_id;
  end if;
end;
$$;

revoke execute on function public.create_income_transaction(text, text, numeric, timestamptz, text, uuid, uuid, uuid, uuid) from public, anon;
revoke execute on function public.create_expense_transaction(text, text, numeric, timestamptz, text, uuid, uuid, uuid, uuid) from public, anon;
revoke execute on function public.create_transfer(text, text, numeric, timestamptz, uuid, text, uuid, uuid) from public, anon;
revoke execute on function public.create_card_payment(text, text, numeric, timestamptz, uuid, uuid) from public, anon;
revoke execute on function public.delete_financial_transaction(uuid) from public, anon;
grant execute on function public.create_income_transaction(text, text, numeric, timestamptz, text, uuid, uuid, uuid, uuid) to authenticated;
grant execute on function public.create_expense_transaction(text, text, numeric, timestamptz, text, uuid, uuid, uuid, uuid) to authenticated;
grant execute on function public.create_transfer(text, text, numeric, timestamptz, uuid, text, uuid, uuid) to authenticated;
grant execute on function public.create_card_payment(text, text, numeric, timestamptz, uuid, uuid) to authenticated;
grant execute on function public.delete_financial_transaction(uuid) to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bank_accounts'
  ) then alter publication supabase_realtime add table public.bank_accounts; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'credit_cards'
  ) then alter publication supabase_realtime add table public.credit_cards; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'categories'
  ) then alter publication supabase_realtime add table public.categories; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'subcategories'
  ) then alter publication supabase_realtime add table public.subcategories; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'transactions'
  ) then alter publication supabase_realtime add table public.transactions; end if;
end $$;
