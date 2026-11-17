/**
 * A narrow compatibility boundary for the original UI.
 *
 * The app used Firestore primitives directly in its screens. Keeping those
 * screens stable while the backend changes is safer when query translation is
 * centralized here. New code should use the typed repository functions at the
 * bottom of this file rather than these Firestore-shaped helpers.
 */
import { supabase } from '../../lib/supabase';
import { DEMO_USER_ID, isDemoSessionActive } from '../../lib/demo-session';
import type { Database } from '../../types/database';
import {
  mapBankAccount,
  mapCategory,
  mapCreditCard,
  mapSubcategory,
  mapTransaction,
  toTimestamp,
  type TransactionQueryRow,
} from './mappers';

type AnyRecord = Record<string, any>;
type TableUpdate<Name extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][Name]['Update'];
type Direction = 'asc' | 'desc';

type CollectionReference = {
  kind: 'collection';
  path: string[];
};

export type DocumentReference = {
  kind: 'document';
  path: string[];
  id: string;
};

type WhereConstraint = {
  kind: 'where';
  field: string;
  operator: '==' | '>=' | '<=';
  value: unknown;
};

type OrderConstraint = {
  kind: 'order';
  field: string;
  direction: Direction;
};

type Constraint = WhereConstraint | OrderConstraint;

type QueryReference = CollectionReference & {
  constraints: Constraint[];
};

type Reference = CollectionReference | QueryReference;

export type QueryDocumentSnapshot<T = AnyRecord> = {
  id: string;
  ref: DocumentReference;
  data: () => T;
};

export type QuerySnapshot<T = AnyRecord> = {
  docs: QueryDocumentSnapshot<T>[];
  empty: boolean;
  forEach: (callback: (document: QueryDocumentSnapshot<T>) => void) => void;
};

type IncrementValue = { readonly __kind: 'increment'; readonly amount: number };

const TRANSACTION_SELECT = `
  *,
  account:bank_accounts!transactions_account_id_fkey(id, bank_name, bank_icon),
  credit_card:credit_cards!transactions_credit_card_id_fkey(id, bank_name, bank_icon),
  source_account:bank_accounts!transactions_source_account_id_fkey(id, bank_name, bank_icon),
  destination_account:bank_accounts!transactions_destination_account_id_fkey(id, bank_name, bank_icon),
  destination_card:credit_cards!transactions_destination_card_id_fkey(id, bank_name, bank_icon),
  category:categories!transactions_category_id_fkey(id, name, emoji, primary_color),
  subcategory:subcategories!transactions_subcategory_id_fkey(id, name, emoji, secondary_color, bold_color)
`;

export const db = Object.freeze({ provider: 'supabase' });

let currentUserId: string | null = null;
void supabase.auth.getSession().then(({ data }) => {
  currentUserId = data.session?.user.id ?? null;
});
supabase.auth.onAuthStateChange((_event, session) => {
  currentUserId = session?.user.id ?? null;
});

export function getAuth() {
  return {
    get currentUser() {
      if (isDemoSessionActive()) return { uid: DEMO_USER_ID };
      return currentUserId ? { uid: currentUserId } : null;
    },
  };
}

export function getFirestore() {
  return db;
}

export function collection(_database: unknown, ...path: string[]): CollectionReference {
  return { kind: 'collection', path };
}

export function doc(_database: unknown, ...path: string[]): DocumentReference {
  const id = path.at(-1);
  if (!id) throw new Error('A document id is required');
  return { kind: 'document', path, id };
}

export function where(
  field: string,
  operator: WhereConstraint['operator'],
  value: unknown,
): WhereConstraint {
  return { kind: 'where', field, operator, value };
}

export function orderBy(field: string, direction: Direction = 'asc'): OrderConstraint {
  return { kind: 'order', field, direction };
}

export function query(reference: Reference, ...constraints: Constraint[]): QueryReference {
  return {
    ...reference,
    constraints: [...('constraints' in reference ? reference.constraints : []), ...constraints],
  };
}

export function increment(amount: number): IncrementValue {
  return { __kind: 'increment', amount };
}

export const Timestamp = {
  now: () => new Date(),
};

function rootCollection(path: string[]): string {
  const candidate = path.at(-1);
  if (candidate === 'subcategories' || candidate === 'incomeSubcategories') {
    return 'subcategories';
  }
  if (path.includes('creditCard')) return 'credit_cards';
  if (path.includes('bankAccounts')) return 'bank_accounts';
  if (path.includes('incomeCategories') || path.includes('categories')) return 'categories';
  if (path.includes('transactions')) return 'transactions';
  if (path.includes('users')) return 'profiles';
  throw new Error(`Unsupported data path: ${path.join('/')}`);
}

function parentId(path: string[]): string | null {
  const leaf = path.at(-1);
  if (leaf !== 'subcategories' && leaf !== 'incomeSubcategories') return null;
  return path.at(-2) ?? null;
}

function dateValue(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return new Date(String(value)).getTime();
}

function compareValues(left: unknown, right: unknown): number {
  if (
    left instanceof Date ||
    right instanceof Date ||
    (left && typeof left === 'object' && 'toDate' in left)
  ) {
    return dateValue(left) - dateValue(right);
  }
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return String(left ?? '').localeCompare(String(right ?? ''));
}

function matches(record: AnyRecord, constraint: WhereConstraint): boolean {
  const left = constraint.field === '__name__' ? record.id : record[constraint.field];
  if (constraint.field === 'userId') return true; // RLS is the source of truth.
  const comparison = compareValues(left, constraint.value);
  if (constraint.operator === '>=') return comparison >= 0;
  if (constraint.operator === '<=') return comparison <= 0;
  return comparison === 0;
}

function applyConstraints(records: AnyRecord[], constraints: Constraint[]): AnyRecord[] {
  let result = records;
  for (const constraint of constraints) {
    if (constraint.kind === 'where') {
      result = result.filter((record) => matches(record, constraint));
    }
  }

  const ordering = constraints.findLast(
    (constraint): constraint is OrderConstraint => constraint.kind === 'order',
  );
  if (ordering) {
    const multiplier = ordering.direction === 'desc' ? -1 : 1;
    result = [...result].sort(
      (left, right) => multiplier * compareValues(left[ordering.field], right[ordering.field]),
    );
  }
  return result;
}

const DEMO_CATEGORY_COLORS = {
  Moradia: ['#A87EFA', '#A87EFA30', '#820AD1'],
  Alimentação: ['#FF865A', '#FF865A30', '#FF5B20'],
  Saúde: ['#FD6FAF', '#FD6FAF30', '#FF2688'],
  Lazer: ['#7BCBE8', '#7BCBE830', '#1599D1'],
  Pet: ['#73DBC9', '#73DBC930', '#24C2A6'],
  Metas: ['#FFAD3A', '#FFAD3A30', '#FF9500'],
  Transporte: ['#FC6060', '#FC606030', '#F62929'],
  Investimento: ['#6B83F0', '#6B83F030', '#3E5FF3'],
  Educação: ['#B4CA75', '#B4CA7530', '#8AB21E'],
  Outros: ['#A47456', '#A4745630', '#644537'],
  Receitas: ['#0CC0DF', '#0CC0DF30', '#0097B2'],
} as const;

const DEMO_BANK_ICON =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const DEMO_CATEGORY_DETAILS = [
  ['home', 'Moradia', '🏠', 2800, 2200],
  ['food', 'Alimentação', '🍽️', 1200, 486.4],
  ['health', 'Saúde', '🏋🏻', 500, 139.9],
  ['leisure', 'Lazer', '🛍️', 600, 185],
  ['pet', 'Pet', '🐶', 300, 89.9],
  ['goals', 'Metas', '🎯', 1000, 0],
  ['transport', 'Transporte', '🚙', 700, 272.5],
  ['investment', 'Investimento', '📈', 1200, 800],
  ['education', 'Educação', '📚', 400, 0],
  ['other', 'Outros', '🪙', 300, 65],
] as const;

function demoTimestamp(day: number) {
  const now = new Date();
  return toTimestamp(new Date(now.getFullYear(), now.getMonth(), day, 12).toISOString());
}

function demoCategories(): AnyRecord[] {
  const createdAt = demoTimestamp(1);
  const expenses = DEMO_CATEGORY_DETAILS.map(
    ([slug, name, emoji, budget, spentAmount]) => {
      const [primaryColor, secondaryColor, boldColor] = DEMO_CATEGORY_COLORS[name];
      return {
        id: `demo-category-${slug}`,
        userId: DEMO_USER_ID,
        kind: 'expense',
        name,
        emoji,
        primaryColor,
        secondaryColor,
        boldColor,
        budget,
        spentAmount,
        income: budget,
        incomeAmount: 0,
        createdAt,
      };
    },
  );
  const [primaryColor, secondaryColor, boldColor] = DEMO_CATEGORY_COLORS.Receitas;
  return [
    ...expenses,
    {
      id: 'demo-category-income',
      userId: DEMO_USER_ID,
      kind: 'income',
      name: 'Receitas',
      emoji: '💼',
      primaryColor,
      secondaryColor,
      boldColor,
      budget: 7200,
      spentAmount: 0,
      income: 7200,
      incomeAmount: 7200,
      createdAt,
    },
  ];
}

function demoSubcategories(categoryId: string | null): AnyRecord[] {
  const category = demoCategories().find((item) => item.id === categoryId);
  if (!category) return [];
  return [
    {
      ...category,
      id: `${category.id}-primary`,
      categoryId: category.id,
      name: category.kind === 'income' ? 'Salário' : category.name,
      budget: category.budget,
      spentAmount: category.spentAmount,
    },
  ];
}

function demoTransactions(): AnyRecord[] {
  const createdAt = demoTimestamp(1);
  const base = {
    userId: DEMO_USER_ID,
    description: '',
    createdAt,
    paymentType: 'contas',
    accountOrCardId: 'demo-account-main',
    accountOrCardName: 'Conta principal',
    accountOrCardIcon: DEMO_BANK_ICON,
  };

  return [
    {
      ...base,
      id: 'demo-transaction-salary',
      type: 'receita',
      direction: 'entrada',
      name: 'Salário',
      amount: 7200,
      date: demoTimestamp(3),
      categoryId: 'demo-category-income',
      categoryName: 'Receitas',
      categoryEmoji: '💼',
      subcategoryId: 'demo-category-income-primary',
      subcategoryName: 'Salário',
    },
    {
      ...base,
      id: 'demo-transaction-rent',
      type: 'despesa',
      direction: 'saida',
      name: 'Aluguel',
      amount: 2200,
      date: demoTimestamp(5),
      categoryId: 'demo-category-home',
      categoryName: 'Moradia',
      categoryEmoji: '🏠',
      subcategoryId: 'demo-category-home-primary',
      subcategoryName: 'Moradia',
    },
    {
      ...base,
      id: 'demo-transaction-market',
      type: 'despesa',
      direction: 'saida',
      name: 'Supermercado',
      amount: 486.4,
      date: demoTimestamp(11),
      categoryId: 'demo-category-food',
      categoryName: 'Alimentação',
      categoryEmoji: '🍽️',
      subcategoryId: 'demo-category-food-primary',
      subcategoryName: 'Alimentação',
    },
    {
      ...base,
      id: 'demo-transaction-gym',
      type: 'despesa',
      direction: 'saida',
      name: 'Academia',
      amount: 139.9,
      date: demoTimestamp(17),
      categoryId: 'demo-category-health',
      categoryName: 'Saúde',
      categoryEmoji: '🏋🏻',
      subcategoryId: 'demo-category-health-primary',
      subcategoryName: 'Saúde',
    },
    {
      ...base,
      id: 'demo-transaction-ride',
      type: 'despesa',
      direction: 'saida',
      name: 'Transporte',
      amount: 72.5,
      date: demoTimestamp(20),
      categoryId: 'demo-category-transport',
      categoryName: 'Transporte',
      categoryEmoji: '🚙',
      subcategoryId: 'demo-category-transport-primary',
      subcategoryName: 'Transporte',
    },
  ];
}

function demoRecords(table: string, path: string[], pathParentId: string | null): AnyRecord[] {
  if (table === 'categories') {
    const kind = path.includes('incomeCategories') ? 'income' : 'expense';
    return demoCategories().filter((category) => category.kind === kind);
  }
  if (table === 'subcategories') return demoSubcategories(pathParentId);
  if (table === 'transactions') return demoTransactions();
  if (table === 'bank_accounts') {
    return [{
      id: 'demo-account-main',
      userId: DEMO_USER_ID,
      bankName: 'Conta principal',
      bankIcon: DEMO_BANK_ICON,
      agencyNumber: '0001',
      accountNumber: '4821',
      balance: 4302.45,
      totalOutFlow: 3078.8,
      totalInflow: 7200,
      type: 'Conta Corrente',
      createdAt: demoTimestamp(1),
    }];
  }
  if (table === 'credit_cards') {
    return [{
      id: 'demo-card-main',
      userId: DEMO_USER_ID,
      bankName: 'Cartão principal',
      bankIcon: DEMO_BANK_ICON,
      cardNumber: '7284',
      validate: '0829',
      balance: 5000,
      spentAmount: 1247.9,
      totalOutFlow: 1247.9,
      totalInflow: 0,
      type: 'Crédito',
      createdAt: demoTimestamp(1),
    }];
  }
  return [{
    id: DEMO_USER_ID,
    uid: DEMO_USER_ID,
    userName: 'Felipe',
    email: 'demo@mymonthly.local',
    whatsApp: '',
  }];
}

async function requireUserId(): Promise<string> {
  if (isDemoSessionActive()) return DEMO_USER_ID;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('Authentication required');
  return data.user.id;
}

async function load(reference: Reference): Promise<AnyRecord[]> {
  const table = rootCollection(reference.path);
  const pathParentId = parentId(reference.path);
  const constraints = 'constraints' in reference ? reference.constraints : [];

  if (isDemoSessionActive()) {
    return applyConstraints(demoRecords(table, reference.path, pathParentId), constraints);
  }

  let records: AnyRecord[];
  const idConstraint = constraints.find(
    (constraint): constraint is WhereConstraint =>
      constraint.kind === 'where' &&
      constraint.field === '__name__' &&
      constraint.operator === '==',
  );

  if (table === 'bank_accounts') {
    let request = supabase
      .from('bank_accounts')
      .select('*')
      .is('archived_at', null);
    if (idConstraint) request = request.eq('id', String(idConstraint.value));
    const { data, error } = await request.order('created_at');
    if (error) throw error;
    records = data.map(mapBankAccount);
  } else if (table === 'credit_cards') {
    let request = supabase
      .from('credit_cards')
      .select('*')
      .is('archived_at', null);
    if (idConstraint) request = request.eq('id', String(idConstraint.value));
    const { data, error } = await request.order('created_at');
    if (error) throw error;
    records = data.map(mapCreditCard);
  } else if (table === 'categories') {
    let request = supabase.from('categories').select('*').is('archived_at', null);
    request = request.eq(
      'kind',
      reference.path.includes('incomeCategories') ? 'income' : 'expense',
    );
    if (idConstraint) request = request.eq('id', String(idConstraint.value));
    const nameConstraint = constraints.find(
      (constraint): constraint is WhereConstraint =>
        constraint.kind === 'where' &&
        constraint.field === 'name' &&
        constraint.operator === '==',
    );
    if (nameConstraint) request = request.eq('name', String(nameConstraint.value));
    const { data, error } = await request.order('created_at');
    if (error) throw error;
    records = data.map(mapCategory);
  } else if (table === 'subcategories') {
    let request = supabase.from('subcategories').select('*').is('archived_at', null);
    if (pathParentId) request = request.eq('category_id', pathParentId);
    if (idConstraint) request = request.eq('id', String(idConstraint.value));
    const categoryConstraint = constraints.find(
      (constraint): constraint is WhereConstraint =>
        constraint.kind === 'where' &&
        constraint.field === 'categoryId' &&
        constraint.operator === '==',
    );
    if (categoryConstraint) {
      request = request.eq('category_id', String(categoryConstraint.value));
    }
    const { data, error } = await request.order('created_at');
    if (error) throw error;
    records = data.map(mapSubcategory);
  } else if (table === 'transactions') {
    let request = supabase
      .from('transactions')
      .select(TRANSACTION_SELECT);
    if (idConstraint) request = request.eq('id', String(idConstraint.value));
    for (const constraint of constraints) {
      if (constraint.kind !== 'where' || constraint.field !== 'date') continue;
      const value = new Date(dateValue(constraint.value)).toISOString();
      if (constraint.operator === '>=') request = request.gte('occurred_at', value);
      if (constraint.operator === '<=') request = request.lte('occurred_at', value);
      if (constraint.operator === '==') request = request.eq('occurred_at', value);
    }
    const { data, error } = await request.order('occurred_at', { ascending: false });
    if (error) throw error;
    records = (data as unknown as TransactionQueryRow[]).map(mapTransaction);
  } else {
    const { data: authData } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    records = data.map((profile) => ({
      uid: profile.id,
      userName: profile.full_name,
      email: authData.user?.email ?? '',
      whatsApp: profile.whatsapp,
    }));
  }

  return applyConstraints(records, constraints);
}

function makeSnapshot(reference: Reference, records: AnyRecord[]): QuerySnapshot {
  const docs = records.map((record) => {
    const ref = doc(db, ...reference.path, String(record.id));
    return { id: String(record.id), ref, data: () => record };
  });
  return { docs, empty: docs.length === 0, forEach: (callback) => docs.forEach(callback) };
}

export async function getDocs(reference: Reference): Promise<QuerySnapshot> {
  return makeSnapshot(reference, await load(reference));
}

export async function getDoc(reference: DocumentReference) {
  const base = collection(db, ...reference.path.slice(0, -1));
  const records = await load(query(base, where('__name__', '==', reference.id)));
  const value = records[0];
  return {
    id: reference.id,
    ref: reference,
    exists: () => Boolean(value),
    data: () => value,
  };
}

type Listener = () => void;
const tableListeners = new Map<string, Set<Listener>>();
const tableChannels = new Map<string, ReturnType<typeof supabase.channel>>();

function listenToTable(table: string, listener: Listener): () => void {
  if (isDemoSessionActive()) return () => undefined;

  let listeners = tableListeners.get(table);
  if (!listeners) {
    listeners = new Set();
    tableListeners.set(table, listeners);
  }
  listeners.add(listener);

  if (!tableChannels.has(table)) {
    const channel = supabase
      .channel(`app:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => tableListeners.get(table)?.forEach((notify) => notify()),
      )
      .subscribe();
    tableChannels.set(table, channel);
  }

  return () => {
    const current = tableListeners.get(table);
    current?.delete(listener);
    if (current?.size === 0) {
      const channel = tableChannels.get(table);
      if (channel) void supabase.removeChannel(channel);
      tableListeners.delete(table);
      tableChannels.delete(table);
    }
  };
}

export function onSnapshot(
  reference: Reference,
  onNext: (snapshot: QuerySnapshot) => void,
  onError: (error: unknown) => void = console.error,
): () => void {
  let active = true;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const refresh = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      void getDocs(reference)
        .then((snapshot) => {
          if (active) onNext(snapshot);
        })
        .catch(onError);
    }, 20);
  };

  refresh();
  const stop = listenToTable(rootCollection(reference.path), refresh);
  return () => {
    active = false;
    if (timer) clearTimeout(timer);
    stop();
  };
}

function digits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

export async function addDoc(reference: CollectionReference, payload: AnyRecord) {
  const userId = await requireUserId();
  if (isDemoSessionActive()) {
    return doc(db, ...reference.path, `demo-${Date.now()}`);
  }
  const table = rootCollection(reference.path);

  if (table === 'bank_accounts') {
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({
        user_id: userId,
        bank_name: payload.bankName,
        bank_icon: payload.bankIcon ?? '',
        agency_number: digits(payload.agencyNumber),
        account_number_last4: digits(payload.accountNumber).slice(-4),
        account_type: payload.type ?? 'Conta Corrente',
        balance: Number(payload.balance ?? 0),
      })
      .select('*')
      .single();
    if (error) throw error;
    return doc(db, ...reference.path, data.id);
  }

  if (table === 'credit_cards') {
    const expiry = digits(payload.validate);
    const year = Number(`20${expiry.slice(2, 4)}`);
    const { data, error } = await supabase
      .from('credit_cards')
      .insert({
        user_id: userId,
        bank_name: payload.bankName,
        bank_icon: payload.bankIcon ?? '',
        card_last4: digits(payload.cardNumber).slice(-4),
        expiry_month: Number(expiry.slice(0, 2)) || null,
        expiry_year: year || null,
        credit_limit: Number(payload.balance ?? 0),
      })
      .select('*')
      .single();
    if (error) throw error;
    return doc(db, ...reference.path, data.id);
  }

  if (table === 'categories') {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        kind: reference.path.includes('incomeCategories') ? 'income' : 'expense',
        name: payload.name,
        emoji: payload.emoji ?? '',
        primary_color: payload.primaryColor ?? '#64748B',
        secondary_color: payload.secondaryColor ?? '#E2E8F0',
        bold_color: payload.boldColor ?? '#334155',
        budget: Number(payload.budget ?? payload.income ?? 0),
      })
      .select('*')
      .single();
    if (error) throw error;
    return doc(db, ...reference.path, data.id);
  }

  if (table === 'subcategories') {
    const categoryId = parentId(reference.path);
    if (!categoryId) throw new Error('A parent category is required');
    const { data, error } = await supabase
      .from('subcategories')
      .insert({
        category_id: categoryId,
        user_id: userId,
        name: payload.name,
        emoji: payload.emoji ?? '',
        primary_color: payload.primaryColor ?? '#64748B',
        secondary_color: payload.secondaryColor ?? '#E2E8F0',
        bold_color: payload.boldColor ?? '#334155',
        budget: Number(payload.budget ?? payload.income ?? 0),
      })
      .select('*')
      .single();
    if (error) throw error;
    return doc(db, ...reference.path, data.id);
  }

  throw new Error('Transactions must be created with an atomic repository function');
}

function plainValue(value: unknown): unknown {
  return value && typeof value === 'object' && '__kind' in value
    ? (value as IncrementValue).amount
    : value;
}

export async function updateDoc(reference: DocumentReference, payload: AnyRecord) {
  if (isDemoSessionActive()) return;
  const table = rootCollection(reference.path);

  if (table === 'profiles') {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: payload.userName, whatsapp: payload.whatsApp })
      .eq('id', reference.id);
    if (error) throw error;
    return;
  }

  if (table === 'bank_accounts') {
    const update: AnyRecord = {};
    if (payload.bankName !== undefined) update.bank_name = payload.bankName;
    if (payload.bankIcon !== undefined) update.bank_icon = payload.bankIcon;
    if (payload.agencyNumber !== undefined) update.agency_number = digits(payload.agencyNumber);
    if (payload.accountNumber !== undefined) update.account_number_last4 = digits(payload.accountNumber).slice(-4);
    if (payload.type !== undefined) update.account_type = payload.type;
    if (Object.keys(update).length === 0) return;
    const { error } = await supabase
      .from('bank_accounts')
      .update(update as TableUpdate<'bank_accounts'>)
      .eq('id', reference.id);
    if (error) throw error;
    return;
  }

  if (table === 'credit_cards') {
    const update: AnyRecord = {};
    if (payload.bankName !== undefined) update.bank_name = payload.bankName;
    if (payload.bankIcon !== undefined) update.bank_icon = payload.bankIcon;
    if (payload.cardNumber !== undefined) update.card_last4 = digits(payload.cardNumber).slice(-4);
    if (payload.balance !== undefined && typeof plainValue(payload.balance) === 'number') {
      update.credit_limit = plainValue(payload.balance);
    }
    if (Object.keys(update).length === 0) return;
    const { error } = await supabase
      .from('credit_cards')
      .update(update as TableUpdate<'credit_cards'>)
      .eq('id', reference.id);
    if (error) throw error;
    return;
  }

  const update: AnyRecord = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.emoji !== undefined) update.emoji = payload.emoji;
  if (payload.primaryColor !== undefined) update.primary_color = payload.primaryColor;
  if (payload.secondaryColor !== undefined) update.secondary_color = payload.secondaryColor;
  if (payload.boldColor !== undefined) update.bold_color = payload.boldColor;
  if (payload.budget !== undefined) update.budget = Number(plainValue(payload.budget));
  if (payload.income !== undefined) update.budget = Number(plainValue(payload.income));
  if (Object.keys(update).length === 0) return;
  const { error } = table === 'categories'
    ? await supabase
        .from('categories')
        .update(update as TableUpdate<'categories'>)
        .eq('id', reference.id)
    : await supabase
        .from('subcategories')
        .update(update as TableUpdate<'subcategories'>)
        .eq('id', reference.id);
  if (error) throw error;
}

export async function deleteDoc(reference: DocumentReference) {
  if (isDemoSessionActive()) return;
  const table = rootCollection(reference.path);
  if (table === 'transactions') {
    const { error } = await supabase.rpc('delete_financial_transaction', {
      p_transaction_id: reference.id,
    });
    if (error) throw error;
    return;
  }
  if (table === 'profiles') throw new Error('Use the delete-account Edge Function');
  const archivedAt = new Date().toISOString();
  const { error } = table === 'bank_accounts'
    ? await supabase.from('bank_accounts').update({ archived_at: archivedAt }).eq('id', reference.id)
    : table === 'credit_cards'
      ? await supabase.from('credit_cards').update({ archived_at: archivedAt }).eq('id', reference.id)
      : table === 'categories'
        ? await supabase.from('categories').update({ archived_at: archivedAt }).eq('id', reference.id)
        : await supabase.from('subcategories').update({ archived_at: archivedAt }).eq('id', reference.id);
  if (error) throw error;
}

export function writeBatch(_database: unknown) {
  const deletes: DocumentReference[] = [];
  return {
    delete: (reference: DocumentReference) => deletes.push(reference),
    commit: async () => {
      await Promise.all(deletes.map(deleteDoc));
    },
  };
}

type TransactionInput = {
  name: string;
  description?: string;
  amount: number;
  occurredAt: Date;
};

// PostgreSQL function parameters accept null unless the function validates
// otherwise, but generated Supabase types currently model UUID arguments as
// non-null strings. Keep the mismatch isolated at the RPC boundary.
const nullableRpcUuid = (value: string | null) => value as string;

export async function createIncomeTransaction(
  input: TransactionInput & {
    paymentType: 'contas' | 'cartoes';
    accountOrCardId: string;
    categoryId: string;
    subcategoryId: string;
  },
) {
  if (isDemoSessionActive()) return;
  const isAccount = input.paymentType === 'contas';
  const { error } = await supabase.rpc('create_income_transaction', {
    p_name: input.name,
    p_description: input.description ?? '',
    p_amount: input.amount,
    p_occurred_at: input.occurredAt.toISOString(),
    p_payment_type: isAccount ? 'account' : 'card',
    p_account_id: nullableRpcUuid(isAccount ? input.accountOrCardId : null),
    p_credit_card_id: nullableRpcUuid(isAccount ? null : input.accountOrCardId),
    p_category_id: input.categoryId,
    p_subcategory_id: input.subcategoryId,
  });
  if (error) throw error;
}

export async function createExpenseTransaction(
  input: TransactionInput & {
    paymentType: 'contas' | 'cartoes';
    accountOrCardId: string;
    categoryId: string;
    subcategoryId: string;
  },
) {
  if (isDemoSessionActive()) return;
  const isAccount = input.paymentType === 'contas';
  const { error } = await supabase.rpc('create_expense_transaction', {
    p_name: input.name,
    p_description: input.description ?? '',
    p_amount: input.amount,
    p_occurred_at: input.occurredAt.toISOString(),
    p_payment_type: isAccount ? 'account' : 'card',
    p_account_id: nullableRpcUuid(isAccount ? input.accountOrCardId : null),
    p_credit_card_id: nullableRpcUuid(isAccount ? null : input.accountOrCardId),
    p_category_id: input.categoryId,
    p_subcategory_id: input.subcategoryId,
  });
  if (error) throw error;
}

export async function createTransfer(
  input: TransactionInput & {
    sourceAccountId: string;
    destinationType: 'contas' | 'cartoes';
    destinationId: string;
  },
) {
  if (isDemoSessionActive()) return;
  const isAccount = input.destinationType === 'contas';
  const { error } = await supabase.rpc('create_transfer', {
    p_name: input.name,
    p_description: input.description ?? '',
    p_amount: input.amount,
    p_occurred_at: input.occurredAt.toISOString(),
    p_source_account_id: input.sourceAccountId,
    p_destination_type: isAccount ? 'account' : 'card',
    p_destination_account_id: nullableRpcUuid(isAccount ? input.destinationId : null),
    p_destination_card_id: nullableRpcUuid(isAccount ? null : input.destinationId),
  });
  if (error) throw error;
}

export async function createCardPayment(
  input: TransactionInput & { sourceAccountId: string; destinationCardId: string },
) {
  if (isDemoSessionActive()) return;
  const { error } = await supabase.rpc('create_card_payment', {
    p_name: input.name,
    p_description: input.description ?? '',
    p_amount: input.amount,
    p_occurred_at: input.occurredAt.toISOString(),
    p_source_account_id: input.sourceAccountId,
    p_destination_card_id: input.destinationCardId,
  });
  if (error) throw error;
}

export async function deleteFinancialTransaction(transactionId: string) {
  if (isDemoSessionActive()) return;
  const { error } = await supabase.rpc('delete_financial_transaction', {
    p_transaction_id: transactionId,
  });
  if (error) throw error;
}
