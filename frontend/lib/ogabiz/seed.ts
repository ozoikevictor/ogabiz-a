import type { AppState } from "./types";

export const businessTypes = [
  "Retail",
  "Wholesale",
  "Fashion",
  "Electronics",
  "Food",
  "Building materials",
  "Beauty",
  "Pharmacy",
  "Mini supermarket",
  "Online seller",
  "Services",
  "Other",
];

export const units = [
  "Piece",
  "Bag",
  "Carton",
  "Pack",
  "Bottle",
  "KG",
  "Litre",
  "Box",
  "Roll",
  "Other",
];

export const paymentMethods = ["Cash", "Bank Transfer", "POS", "Card", "Other"];

export const expenseCategories = [
  "Transportation",
  "Rent",
  "Electricity",
  "Staff",
  "Supplier Payment",
  "Internet",
  "Packaging",
  "Fuel",
  "Maintenance",
  "Other",
];

export const initialState: AppState = {
  user: {
    fullName: "",
    email: "",
    phone: "",
  },
  business: {
    name: "",
    type: "Retail",
    phone: "",
    email: "",
    location: "",
    currency: "NGN",
    description: "",
  },
  products: [],
  customers: [],
  sales: [],
  expenses: [],
  debts: [],
  activityLog: [],
};
