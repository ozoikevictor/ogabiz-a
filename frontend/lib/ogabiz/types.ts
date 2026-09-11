export type View =
  | "landing"
  | "register"
  | "login"
  | "forgot"
  | "onboarding"
  | "profile"
  | "dashboard"
  | "sales"
  | "inventory"
  | "customers"
  | "debts"
  | "expenses"
  | "reports"
  | "assistant"
  | "notifications"
  | "settings";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  unit: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
};

export type Sale = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number;
  customerId?: string;
  customerName?: string;
  paymentMethod: string;
  paymentStatus: "Paid" | "Partially Paid" | "Unpaid";
  amountPaid: number;
  date: string;
  notes?: string;
};

export type Expense = {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes?: string;
};

export type DebtPayment = {
  id: string;
  amount: number;
  date: string;
  notes?: string;
};

export type Debt = {
  id: string;
  customerId: string;
  customerName: string;
  amountOwed: number;
  amountPaid: number;
  dateCreated: string;
  dueDate: string;
  description: string;
  payments: DebtPayment[];
};

export type Business = {
  id?: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  location: string;
  currency: string;
  description: string;
  logo?: string;
};

export type User = {
  fullName: string;
  email: string;
  phone: string;
};

export type AppState = {
  user: User;
  business: Business;
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  debts: Debt[];
  activityLog: string[];
};
