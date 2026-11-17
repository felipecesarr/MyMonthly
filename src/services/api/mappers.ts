import type { Database } from '../../types/database';
import type {
  AppTimestamp,
  BankAccount,
  Category,
  CreditCard,
  Subcategory,
  Transaction,
} from './types';

type Tables = Database['public']['Tables'];
type BankAccountRow = Tables['bank_accounts']['Row'];
type CreditCardRow = Tables['credit_cards']['Row'];
type CategoryRow = Tables['categories']['Row'];
type SubcategoryRow = Tables['subcategories']['Row'];
type TransactionRow = Tables['transactions']['Row'];

export function toTimestamp(value: string): AppTimestamp {
  const date = new Date(value);
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => new Date(date),
  };
}

export function mapBankAccount(row: BankAccountRow): BankAccount {
  return {
    id: row.id,
    userId: row.user_id,
    bankName: row.bank_name,
    bankIcon: row.bank_icon,
    agencyNumber: row.agency_number,
    accountNumber: row.account_number_last4,
    balance: Number(row.balance),
    totalOutFlow: Number(row.total_outflow),
    totalInflow: Number(row.total_inflow),
    type: row.account_type,
    createdAt: toTimestamp(row.created_at),
  };
}

export function mapCreditCard(row: CreditCardRow): CreditCard {
  const month = row.expiry_month?.toString().padStart(2, '0') ?? '';
  const year = row.expiry_year ? row.expiry_year.toString().slice(-2) : '';
  return {
    id: row.id,
    userId: row.user_id,
    bankName: row.bank_name,
    bankIcon: row.bank_icon,
    cardNumber: row.card_last4,
    validate: `${month}${year}`,
    balance: Number(row.credit_limit),
    spentAmount: Number(row.current_spend),
    totalOutFlow: Number(row.total_outflow),
    totalInflow: Number(row.total_inflow),
    type: 'Crédito',
    createdAt: toTimestamp(row.created_at),
  };
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind === 'income' ? 'income' : 'expense',
    name: row.name,
    emoji: row.emoji,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    boldColor: row.bold_color,
    budget: Number(row.budget),
    spentAmount: Number(row.spent_amount),
    income: Number(row.budget),
    incomeAmount: Number(row.income_amount),
    createdAt: toTimestamp(row.created_at),
  };
}

export function mapSubcategory(row: SubcategoryRow): Subcategory {
  return {
    ...mapCategory({ ...row, kind: 'expense', is_default: false }),
    categoryId: row.category_id,
  };
}

type Related = { id: string; bank_name: string; bank_icon: string } | null;
type RelatedCategory = {
  id: string;
  name: string;
  emoji: string;
  primary_color: string;
} | null;
type RelatedSubcategory = {
  id: string;
  name: string;
  emoji: string;
  secondary_color: string;
  bold_color: string;
} | null;

export type TransactionQueryRow = TransactionRow & {
  account: Related;
  credit_card: Related;
  source_account: Related;
  destination_account: Related;
  destination_card: Related;
  category: RelatedCategory;
  subcategory: RelatedSubcategory;
};

function mapTransactionType(type: string): Transaction['type'] {
  switch (type) {
    case 'income':
      return 'receita';
    case 'expense':
      return 'despesa';
    case 'transfer':
      return 'transferencia';
    case 'card_payment':
      return 'fatura';
    default:
      throw new Error(`Unsupported transaction type: ${type}`);
  }
}

export function mapTransaction(row: TransactionQueryRow): Transaction {
  const paymentTarget = row.payment_type === 'account' ? row.account : row.credit_card;
  const destination = row.destination_account ?? row.destination_card;

  return {
    id: row.id,
    userId: row.user_id,
    type: mapTransactionType(row.type),
    direction: row.direction === 'in' ? 'entrada' : row.direction === 'out' ? 'saida' : undefined,
    transferGroupId: row.transfer_group_id ?? undefined,
    name: row.name,
    description: row.description,
    amount: Number(row.amount),
    date: toTimestamp(row.occurred_at),
    createdAt: toTimestamp(row.created_at),
    paymentType: row.payment_type === 'account' ? 'contas' : row.payment_type === 'card' ? 'cartoes' : undefined,
    accountOrCardId: paymentTarget?.id,
    accountOrCardName: paymentTarget?.bank_name,
    accountOrCardIcon: paymentTarget?.bank_icon,
    fromId: row.source_account?.id,
    fromName: row.source_account?.bank_name,
    fromIcon: row.source_account?.bank_icon,
    fromType: row.source_account ? 'contas' : undefined,
    toId: destination?.id,
    toName: destination?.bank_name,
    toIcon: destination?.bank_icon,
    toType: row.destination_account ? 'contas' : row.destination_card ? 'cartoes' : undefined,
    bankIcon: row.direction === 'out' ? row.source_account?.bank_icon : destination?.bank_icon,
    categoryId: row.category?.id,
    categoryName: row.category?.name,
    categoryEmoji: row.category?.emoji,
    categoryPrimaryColor: row.category?.primary_color,
    subcategoryId: row.subcategory?.id,
    subcategoryName: row.subcategory?.name,
    subcategoryEmoji: row.subcategory?.emoji,
    subcategorySecondaryColor: row.subcategory?.secondary_color,
    subcategoryBoldColor: row.subcategory?.bold_color,
  };
}
