export type AppTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
};

export type BankAccount = {
  id: string;
  userId: string;
  bankName: string;
  bankIcon: string;
  agencyNumber: string;
  accountNumber: string;
  balance: number;
  totalOutFlow: number;
  totalInflow: number;
  type: string;
  createdAt: AppTimestamp;
};

export type CreditCard = {
  id: string;
  userId: string;
  bankName: string;
  bankIcon: string;
  cardNumber: string;
  validate: string;
  balance: number;
  spentAmount: number;
  totalOutFlow: number;
  totalInflow: number;
  type: string;
  createdAt: AppTimestamp;
};

export type Category = {
  id: string;
  userId: string;
  kind: 'expense' | 'income';
  name: string;
  emoji: string;
  primaryColor: string;
  secondaryColor: string;
  boldColor: string;
  budget: number;
  spentAmount: number;
  income: number;
  incomeAmount: number;
  createdAt: AppTimestamp;
};

export type Subcategory = Omit<Category, 'kind'> & {
  categoryId: string;
};

export type Transaction = {
  id: string;
  userId: string;
  type: 'receita' | 'despesa' | 'transferencia' | 'fatura';
  direction?: 'entrada' | 'saida';
  transferGroupId?: string;
  name: string;
  description: string;
  amount: number;
  date: AppTimestamp;
  createdAt: AppTimestamp;
  paymentType?: 'contas' | 'cartoes';
  accountOrCardId?: string;
  accountOrCardName?: string;
  accountOrCardIcon?: string;
  fromId?: string;
  fromName?: string;
  fromIcon?: string;
  fromType?: 'contas';
  toId?: string;
  toName?: string;
  toIcon?: string;
  toType?: 'contas' | 'cartoes';
  bankIcon?: string;
  categoryId?: string;
  categoryName?: string;
  categoryEmoji?: string;
  categoryPrimaryColor?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  subcategoryEmoji?: string;
  subcategorySecondaryColor?: string;
  subcategoryBoldColor?: string;
};

export type Profile = {
  uid: string;
  userName: string;
  email: string;
  whatsApp: string;
};

