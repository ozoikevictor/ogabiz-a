import type { AppState, Debt, Product, Sale } from "./types";

export const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const stockStatus = (product: Product) => {
  if (product.quantity <= 0) return "Out of Stock";
  if (product.quantity <= product.lowStockThreshold) return "Low Stock";
  return "In Stock";
};

export const debtStatus = (debt: Debt) => {
  const balance = debt.amountOwed - debt.amountPaid;
  if (balance <= 0) return "Paid";
  if (new Date(debt.dueDate) < new Date()) return "Overdue";
  if (debt.amountPaid > 0) return "Partially Paid";
  return "Unpaid";
};

export const saleRevenue = (sale: Sale) => sale.quantity * sale.sellingPrice;
export const saleCost = (sale: Sale) => sale.quantity * sale.costPrice;
export const saleProfit = (sale: Sale) => saleRevenue(sale) - saleCost(sale);

export const totals = (state: AppState) => {
  const revenue = state.sales.reduce((sum, sale) => sum + saleRevenue(sale), 0);
  const cogs = state.sales.reduce((sum, sale) => sum + saleCost(sale), 0);
  const expenses = state.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const debt = state.debts.reduce(
    (sum, item) => sum + Math.max(item.amountOwed - item.amountPaid, 0),
    0,
  );

  return {
    revenue,
    cogs,
    grossProfit: revenue - cogs,
    expenses,
    netProfit: revenue - cogs - expenses,
    debt,
    totalProducts: state.products.length,
    lowStock: state.products.filter(
      (product) => stockStatus(product) !== "In Stock",
    ).length,
  };
};
