"use client";

import type { Dispatch, FormEvent, KeyboardEvent, ReactNode, SetStateAction } from "react";
import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  BarChart3,
  Bot,
  Boxes,
  Check,
  DoorOpen,
  LayoutDashboard,
  Menu,
  Mic,
  Bell,
  PackagePlus,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShoppingCart,
  User,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AppState,
  Business,
  Customer,
  Debt,
  Expense,
  Product,
  Sale,
  View,
} from "@/lib/ogabiz/types";
import {
  businessTypes,
  expenseCategories,
  initialState,
  paymentMethods,
  units,
} from "@/lib/ogabiz/seed";
import {
  debtStatus,
  money,
  saleProfit,
  saleRevenue,
  stockStatus,
  totals,
} from "@/lib/ogabiz/calculations";

const navItems = [
  ["dashboard", LayoutDashboard, "Dashboard"],
  ["sales", ShoppingCart, "Sales"],
  ["inventory", Boxes, "Inventory"],
  ["customers", Users, "Customers"],
  ["debts", WalletCards, "Debts"],
  ["expenses", ReceiptText, "Expenses"],
  ["reports", BarChart3, "Reports"],
  ["assistant", Bot, "OgaBiz Assistant"],
  ["notifications", Bell, "Notifications"],
  ["settings", Settings, "Settings"],
] as const;

const apiBaseUrl = "http://localhost:5000";
const storageKey = "ogabiz_state";
const viewPaths: Record<View, string> = {
  landing: "/",
  register: "/register",
  login: "/login",
  forgot: "/forgot-password",
  onboarding: "/setup",
  profile: "/profile",
  dashboard: "/dashboard",
  sales: "/sales",
  inventory: "/inventory",
  customers: "/customers",
  debts: "/debts",
  expenses: "/expenses",
  reports: "/reports",
  assistant: "/assistant",
  notifications: "/notifications",
  settings: "/settings",
};
const pathToView = (path: string): View => {
  const cleanPath = path.replace(/\/+$/, "") || "/";
  if (cleanPath === "/product" || cleanPath === "/products") return "inventory";
  if (cleanPath === "/customer" || cleanPath === "/customer-list") return "customers";
  if (cleanPath === "/sale" || cleanPath === "/sell") return "sales";
  if (cleanPath === "/debt") return "debts";
  if (cleanPath === "/expense") return "expenses";
  if (cleanPath === "/report") return "reports";
  if (cleanPath === "/ai" || cleanPath === "/oga-assistant") return "assistant";
  if (cleanPath === "/notification") return "notifications";
  if (cleanPath === "/setting") return "settings";
  if (cleanPath === "/products") return "inventory";
  return (Object.entries(viewPaths).find(([, route]) => route === cleanPath)?.[0] as View) || "landing";
};
const protectedViews: View[] = ["profile", "dashboard", "sales", "inventory", "customers", "debts", "expenses", "reports", "assistant", "notifications", "settings"];

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const getMongoId = (record: { _id?: string; id?: string } | null | undefined) => {
  if (!record) return "";
  return String(record._id || record.id || "");
};
const dateOnly = (value: unknown) => {
  if (!value) return "";
  return new Date(String(value)).toISOString().slice(0, 10);
};

function mapDashboardData(data: any, currentState: AppState): AppState {
  const businessId = getMongoId(data.business);
  if (businessId) window.localStorage.setItem("ogabiz_business_id", businessId);

  return {
    ...currentState,
    business: {
      ...currentState.business,
      id: businessId || currentState.business.id,
      name: data.business?.name || currentState.business.name,
      type: data.business?.type || currentState.business.type,
      phone: data.business?.phone || currentState.business.phone,
      email: data.business?.email || currentState.business.email,
      location: data.business?.location || currentState.business.location,
      currency: data.business?.currency || currentState.business.currency,
      description: data.business?.description || currentState.business.description,
      logo: data.business?.logo || currentState.business.logo,
    },
    products: (data.products || []).map((product: any) => ({
      id: getMongoId(product),
      name: product.name,
      sku: product.sku || "",
      category: product.category || "",
      description: product.description || "",
      costPrice: Number(product.costPrice || 0),
      sellingPrice: Number(product.sellingPrice || 0),
      quantity: Number(product.quantity || 0),
      lowStockThreshold: Number(product.lowStockThreshold || 5),
      unit: product.unit || "Piece",
    })),
    customers: (data.customers || []).map((customer: any) => ({
      id: getMongoId(customer),
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      notes: customer.notes || "",
    })),
    sales: (data.sales || []).map((sale: any) => ({
      id: getMongoId(sale),
      productId: getMongoId(sale.productId) || String(sale.productId || ""),
      productName: sale.productId?.name || "Product",
      quantity: Number(sale.quantity || 0),
      sellingPrice: Number(sale.sellingPrice || 0),
      costPrice: Number(sale.costPrice || 0),
      customerId: sale.customerId ? getMongoId(sale.customerId) || String(sale.customerId) : undefined,
      customerName: sale.customerId?.name,
      paymentMethod: sale.paymentMethod || "Cash",
      paymentStatus: sale.paymentStatus || "Paid",
      amountPaid: Number(sale.amountPaid || 0),
      date: dateOnly(sale.date),
      notes: sale.notes || "",
    })),
    expenses: (data.expenses || []).map((expense: any) => ({
      id: getMongoId(expense),
      name: expense.name,
      category: expense.category,
      amount: Number(expense.amount || 0),
      date: dateOnly(expense.date),
      paymentMethod: expense.paymentMethod || "Cash",
      notes: expense.notes || "",
    })),
    debts: (data.debts || []).map((debt: any) => ({
      id: getMongoId(debt),
      customerId: getMongoId(debt.customerId) || String(debt.customerId || ""),
      customerName: debt.customerId?.name || "Customer",
      amountOwed: Number(debt.amountOwed || 0),
      amountPaid: Number(debt.amountPaid || 0),
      dateCreated: dateOnly(debt.dateCreated),
      dueDate: dateOnly(debt.dueDate),
      description: debt.description || "",
      payments: (debt.payments || []).map((payment: any) => ({
        id: getMongoId(payment) || newId("pay"),
        amount: Number(payment.amount || 0),
        date: dateOnly(payment.date),
        notes: payment.notes || "",
      })),
    })),
  };
}

async function loadDashboardState(businessId: string, baseState: AppState) {
  const response = await fetch(`${apiBaseUrl}/api/dashboard/${businessId}`);
  if (!response.ok) return baseState;
  const data = await response.json();
  return mapDashboardData(data, baseState);
}

export function OgaBizApp() {
  const [view, setView] = useState<View>("landing");
  const [state, setState] = useState<AppState>(initialState);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [notice, setNotice] = useState("");
  const [backendReady, setBackendReady] = useState(false);
  const [restoringAccount, setRestoringAccount] = useState(true);

  const loadAccount = async () => {
    const businessId = window.localStorage.getItem("ogabiz_business_id");
    const savedState = window.localStorage.getItem(storageKey);
    if (!businessId || !savedState) return false;
    try {
      const localState = JSON.parse(savedState);
      setState(await loadDashboardState(businessId, localState));
      setBackendReady(true);
      return true;
    } catch {
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem("ogabiz_business_id");
      setBackendReady(false);
      return false;
    }
  };

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const routeView = pathToView(window.location.pathname);
      const restored = await loadAccount();
      if (!active) return;
      if (restored) {
        const nextView = protectedViews.includes(routeView) ? routeView : "profile";
        if (nextView !== "profile" && window.location.pathname === viewPaths[nextView]) {
          window.history.replaceState(null, "", viewPaths.profile);
          window.history.pushState(null, "", viewPaths[nextView]);
        }
        setView(nextView);
      } else {
        setView(protectedViews.includes(routeView) ? "login" : routeView);
      }
      setRestoringAccount(false);
    };
    restore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem("ogabiz_business_id")) {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const syncFromUrl = () => {
      const routeView = pathToView(window.location.pathname);
      const isProtected = protectedViews.includes(routeView);
      const hasAccount = Boolean(window.localStorage.getItem("ogabiz_business_id"));
      setView(isProtected && !hasAccount ? "login" : routeView);
      setMobileOpen(false);
      setNotice("");
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const go = (next: View, replace = false) => {
    const nextPath = viewPaths[next];
    if (window.location.pathname !== nextPath) {
      const keepDashboardHistoryClean = protectedViews.includes(view) && protectedViews.includes(next) && view !== "profile";
      if (replace || keepDashboardHistoryClean) {
        window.history.replaceState(null, "", nextPath);
      } else {
        window.history.pushState(null, "", nextPath);
      }
    }
    setView(next);
    setMobileOpen(false);
    setNotice("");
  };

  const logout = () => {
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem("ogabiz_business_id");
    setState(initialState);
    setBackendReady(false);
    go("landing", true);
  };

  const signedIn = !["landing", "register", "login", "forgot", "onboarding"].includes(view);

  if (signedIn && view === "profile") {
    return (
      <div className="app-workspace min-h-screen text-foreground">
        <ProfileHomeHeader state={state} onDashboard={() => go("dashboard")} onLogout={logout} />
        <main className="relative z-10 mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {notice && (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              {notice}
            </div>
          )}
          <ProfilePage state={state} go={go} />
        </main>
      </div>
    );
  }

  if (restoringAccount) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f6f2] p-4 text-[#101915]">
        <div className="rounded-lg border bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Opening your OgaBiz workspace...</p>
        </div>
      </main>
    );
  }

  return signedIn ? (
    <div className="app-workspace min-h-screen text-foreground">
      <Sidebar
        collapsed={collapsed}
        current={view}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onNavigate={go}
        onLogout={logout}
      />
      <main className={`min-h-screen transition-all ${collapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AppHeader
          current={view}
          state={state}
          onMenu={() => setMobileOpen(true)}
          onSidebarToggle={() => setCollapsed((value) => !value)}
          sidebarCollapsed={collapsed}
          onQuickSale={() => go("sales")}
          onProfile={() => go("profile")}
          onLogout={logout}
        />
        <div className="relative z-10 p-4 md:p-6 lg:p-8">
        {notice && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {notice}
          </div>
        )}
        {view === "dashboard" && <Dashboard state={state} go={go} />}
        {view === "inventory" && <Inventory state={state} setState={setState} setNotice={setNotice} backendReady={backendReady} />}
        {view === "sales" && <Sales state={state} setState={setState} setNotice={setNotice} backendReady={backendReady} />}
        {view === "expenses" && <Expenses state={state} setState={setState} setNotice={setNotice} backendReady={backendReady} />}
        {view === "customers" && <Customers state={state} setState={setState} setNotice={setNotice} backendReady={backendReady} />}
        {view === "debts" && <Debts state={state} setState={setState} setNotice={setNotice} backendReady={backendReady} />}
        {view === "reports" && <Reports state={state} />}
        {view === "assistant" && <Assistant state={state} setState={setState} setNotice={setNotice} backendReady={backendReady} />}
        {view === "notifications" && <Notifications state={state} go={go} />}
        {view === "settings" && <SettingsPage state={state} setState={setState} setNotice={setNotice} backendReady={backendReady} />}
        </div>
      </main>
    </div>
  ) : (
    <PublicFlow view={view} go={go} state={state} setState={setState} setBackendReady={setBackendReady} notice={notice} setNotice={setNotice} loadAccount={loadAccount} />
  );
}

function PublicFlow({
  view,
  go,
  state,
  setState,
  setBackendReady,
  notice,
  setNotice,
  loadAccount,
}: {
  view: View;
  go: (view: View) => void;
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  setBackendReady: (ready: boolean) => void;
  notice: string;
  setNotice: (notice: string) => void;
  loadAccount: () => Promise<boolean>;
}) {
  const showNotice = (children: ReactNode) => (
    <div>
      {notice && (
        <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm">
          {notice}
        </div>
      )}
      {children}
    </div>
  );

  if (view === "register") return showNotice(<Auth title="Create your OgaBiz account" action="Create account" onSubmit={async (values) => {
    try {
      const data = await saveRecord("/api/auth/register", { fullName: values["Full name"], email: values.Email, phone: values["Phone number"], password: values.Password });
      if (!data.user || !data.business) {
        throw new Error("Registration failed. Please check your details.");
      }

      if (data.user && data.business) {
        const businessId = getMongoId(data.business);
        if (businessId) window.localStorage.setItem("ogabiz_business_id", businessId);
        const accountState = {
          ...state,
          user: data.user,
          business: {
            ...state.business,
            id: businessId || state.business.id,
            name: data.business.name || state.business.name,
            type: data.business.type || state.business.type,
            phone: data.business.phone || state.business.phone,
            email: data.business.email || state.business.email,
            location: data.business.location || state.business.location,
            currency: data.business.currency || state.business.currency,
            description: data.business.description || state.business.description,
            logo: data.business.logo || state.business.logo,
          },
        };
        setState(businessId ? await loadDashboardState(businessId, accountState) : accountState);
      }
      setBackendReady(true);
      setNotice("");
      setState((s) => ({ ...s, user: { ...s.user, fullName: values["Full name"] || s.user.fullName, email: values.Email || s.user.email, phone: values["Phone number"] || s.user.phone } }));
      go("onboarding");
    } catch (error) {
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem("ogabiz_business_id");
      setBackendReady(false);
      setNotice(error instanceof Error ? error.message : "Registration failed. Please try again.");
    }
  }} go={go} register />);
  if (view === "login") return showNotice(<Auth title="Welcome back" action="Sign in" onSubmit={async (values) => {
    try {
      const data = await saveRecord("/api/auth/login", { email: values.Email, password: values.Password });
      if (!data.user || !data.business) {
        throw new Error("Invalid email or password.");
      }
      if (data.user && data.business) {
        const businessId = getMongoId(data.business);
        if (businessId) window.localStorage.setItem("ogabiz_business_id", businessId);
        const accountState = {
          ...state,
          user: data.user,
          business: {
            ...state.business,
            id: businessId || state.business.id,
            name: data.business.name || state.business.name,
            type: data.business.type || state.business.type,
            phone: data.business.phone || state.business.phone,
            email: data.business.email || state.business.email,
            location: data.business.location || state.business.location,
            currency: data.business.currency || state.business.currency,
            description: data.business.description || state.business.description,
            logo: data.business.logo || state.business.logo,
          },
        };
        setState(businessId ? await loadDashboardState(businessId, accountState) : accountState);
      }
      setBackendReady(true);
      setNotice("");
      go("profile");
    } catch (error) {
      setBackendReady(false);
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem("ogabiz_business_id");
      setNotice(error instanceof Error ? error.message : "Invalid email or password.");
    }
  }} go={go} />);
  if (view === "forgot") return showNotice(<Auth title="Reset password" action="Send reset link" onSubmit={() => go("login")} go={go} forgot />);
  if (view === "onboarding") {
    return <Onboarding state={state} setState={setState} onDone={async (business) => {
      try {
        await saveRecord("/api/business", business);
        setState((current) => ({ ...current, business }));
        setBackendReady(true);
        await loadAccount();
      } catch {
        setBackendReady(false);
      }
      go("profile");
    }} />;
  }
  return <Landing state={state} go={go} />;
}

function Landing({ state, go }: { state: AppState; go: (view: View) => void }) {
  const accountReady = Boolean(state.user.email || state.business.name);
  const businessName = state.business.name || "Your Business";
  const t = totals(state);
  const previewStats = accountReady
    ? [
        `Sales ${money(t.revenue)}`,
        `Profit ${money(t.netProfit)}`,
        `Debts ${money(t.debt)}`,
        `Low stock ${t.lowStock}`,
      ]
    : ["Sales NGN 57,500", "Profit NGN 12,500", "Debts NGN 8,000", "Low stock 2"];
  const quickSignals = accountReady
    ? [
        `${state.sales.length} sales`,
        `${state.products.length} products`,
        `${state.debts.length} debts`,
      ]
    : ["Sales", "Stock", "Debt"];
  const features = [
    ["Sales", "Record each sale with the items, amount paid, payment method, and customer balance when someone buys on credit."],
    ["Inventory", "Add products, prices, quantities, and low-stock limits so you always know what needs restocking."],
    ["Customers", "Keep customer names, phone numbers, purchases, and outstanding debts together instead of searching through chats."],
    ["Expenses", "Track rent, transport, staff, repairs, packaging, subscriptions, and other costs that reduce your profit."],
    ["Reports", "See daily revenue, open debts, low-stock products, and cash movement without calculating everything by hand."],
    ["Assistant", "Ask business questions in plain language, then use your own records to understand what is happening."],
  ];
  const explainers = [
    ["Create your business account", "Register with your name, email, phone number, and password. OgaBiz checks that the email is not already used, then creates a private business workspace for your records."],
    ["Set up the business profile", "Add the business name, type, location, currency, and basic details. This makes every product, sale, expense, customer, and debt belong to the right business."],
    ["Add products and stock", "Save product names, SKU, category, cost price, selling price, quantity, unit, and low-stock level. The dashboard can then show what is available and what needs restocking."],
    ["Record sales properly", "When you sell, choose the product, quantity, amount paid, payment method, and customer if needed. OgaBiz reduces stock and keeps the sale under your real account."],
    ["Track customers and debts", "Save customer names, phone numbers, and balances. If someone buys on credit, the debt stays visible until payment is recorded."],
    ["Understand profit and expenses", "Expenses are deducted from your sales profit, so the reports can show a clearer picture of money coming in, money going out, and what the business keeps."],
    ["Use AI as a business helper", "The assistant reads your saved records and helps answer questions like what sold most, what is low in stock, who owes money, and what action to take next."],
  ];
  const workflow = [
    ["Set up your business", "Create your account, add your business name, currency, category, and basic profile so every record belongs to the right business."],
    ["Add products and customers", "Put in your stock list and customer details first. This makes sales, debts, and reports easier to connect later."],
    ["Record daily activity", "As sales and expenses happen, enter them once. OgaBiz keeps inventory, balances, and totals moving together."],
    ["Review and decide", "Use the dashboard to spot low stock, unpaid debts, strong products, and spending patterns before the day gets away from you."],
  ];
  const routes = [
    ["Dashboard", "Your main view for sales, profit, expenses, debts, stock alerts, and quick actions."],
    ["Inventory", "Where products are added, updated, and watched for low-stock problems."],
    ["Sales", "Where every sale is recorded so revenue and stock can update together."],
    ["Customers", "Where customer details and buying history stay organized."],
    ["Debts", "Where unpaid balances and repayments are followed until they are cleared."],
    ["Expenses", "Where running costs are saved so profit does not look higher than it really is."],
    ["Reports", "Where the app turns daily records into business numbers you can understand."],
  ];
  const aiSteps = [
    ["Reads your records", "It uses the products, sales, debts, expenses, and customers saved under your business."],
    ["Calculates from real activity", "It does not need demo figures. It works from totals, quantities, costs, selling prices, and balances."],
    ["Suggests the next action", "It can point out low stock, unpaid debt, slow products, strong products, and spending patterns."],
  ];
  const faqs = [
    ["Is OgaBiz AI a marketplace?", "No. It is a business management workspace. It helps you run and understand your own shop, store, or service business."],
    ["Can I use it for customers who buy on credit?", "Yes. You can save customer details, connect debts to the customer, and track what has been paid or is still pending."],
    ["Will my records be saved?", "Yes. After you register or log in properly, your products, customers, sales, expenses, and debts are saved under your business account."],
    ["Can I use it on phone?", "Yes. The layout is built to work on phone screens and bigger screens, so daily recording can happen wherever you are working."],
  ];

  return (
    <main className="landing-shell min-h-screen pt-16 text-[#101915]">
      <header className="landing-header fixed inset-x-0 top-0 z-50">
        <div className="landing-header-inner mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="landing-logo-mark grid size-11 place-items-center rounded-md bg-[#0d6b43] text-lg font-bold text-white">O</span>
            <span className="landing-brand text-xl font-semibold"><span>OgaBiz</span> <span>AI</span></span>
          </div>
          <nav className="landing-nav-pill hidden items-center gap-1 rounded-md border border-[#d8e3d9] bg-[#f4f6f2]/80 p-1 text-sm text-muted-foreground md:flex">
            <a href="#features" className="landing-nav-link rounded px-3 py-2">Features</a>
            <a href="#learn" className="landing-nav-link rounded px-3 py-2">How It Works</a>
            <a href="#workflow" className="landing-nav-link rounded px-3 py-2">Workflow</a>
            <a href="#ai" className="landing-nav-link rounded px-3 py-2">AI</a>
            <a href="#faq" className="landing-nav-link rounded px-3 py-2">FAQ</a>
          </nav>
          <div className="landing-header-actions flex gap-2">
            <Button className="hidden bg-transparent sm:inline-flex" variant="ghost" onClick={() => go(accountReady ? "profile" : "login")}>{accountReady ? "My Profile" : "Sign In"}</Button>
            <Button className="shadow-md shadow-emerald-900/15" onClick={() => go(accountReady ? "profile" : "register")}>{accountReady ? "Continue" : "Start Free"}</Button>
          </div>
        </div>
      </header>
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_.95fr]">
        <div className="landing-reveal">
          <p className="landing-pill mb-4 inline-flex rounded-md bg-[#e7f4ec] px-3 py-2 text-sm font-semibold text-[#0d6b43]">Business control for everyday traders</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Know your sales, stock, debts, and profit before the day ends.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {accountReady
              ? `${businessName} is ready. Open your dashboard to continue tracking products, customers, expenses, sales, and reports from your own account.`
              : "OgaBiz AI gives small business owners a clear workspace for products, customers, expenses, sales, and reports without spreadsheet stress."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => go(accountReady ? "profile" : "register")}>{accountReady ? "Continue to Profile" : "Start Free"}</Button>
            <Button size="lg" variant="outline" onClick={() => go(accountReady ? "dashboard" : "login")}>{accountReady ? "Go to Dashboard" : "Sign In"}</Button>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            {quickSignals.map((item) => <div key={item} className="landing-tile rounded-md border border-white/80 bg-white/86 p-3 shadow-sm backdrop-blur">{item}<p className="mt-1 text-muted-foreground">{accountReady ? "in your account" : "tracked live"}</p></div>)}
          </div>
        </div>
        <div className="landing-dashboard rounded-lg border border-white/80 bg-white/92 p-4 shadow-xl backdrop-blur sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{accountReady ? "Your workspace" : "Live preview"}</p>
              <h2 className="text-2xl font-semibold">{accountReady ? businessName : "Business Overview"}</h2>
            </div>
            <div className="rounded-md bg-[#e7f4ec] p-2 text-[#0d6b43]"><BadgeDollarSign className="size-6" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {previewStats.map((item, index) => (
              <div key={item} className="landing-tile rounded-md bg-[#f4f6f2] p-4 text-sm font-medium" style={{ animationDelay: `${index * 90}ms` }}>{item}</div>
            ))}
          </div>
          <div className="mt-5 h-40 rounded-md bg-[linear-gradient(180deg,#e7f4ec,#ffffff)] p-4">
            <div className="flex h-full items-end gap-3">
              {[42, 68, 55, 80, 74, 92, 64].map((height, index) => (
                <span key={index} className="landing-bar flex-1 rounded-t bg-[#0d6b43]" style={{ height: `${height}%`, animationDelay: `${index * 80}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="landing-section landing-motion-rise mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-[#0d6b43]">Features</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Everything your daily business needs, arranged clearly.</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            OgaBiz is built around the daily jobs small business owners repeat: selling, restocking, collecting money, paying expenses, and checking if the business is growing.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(([feature, description], index) => <Card key={feature} className="landing-card rounded-lg border-[#d8e3d9] bg-white" style={{ animationDelay: `${index * 70}ms` }}><CardHeader><CardTitle>{feature}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-muted-foreground">{description}</CardContent></Card>)}
        </div>
      </section>
      <section id="learn" className="landing-section landing-motion-slide mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase text-[#0d6b43]">How the app works</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Seven parts that make the whole business clear.</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Before anyone creates an account, they should understand what OgaBiz is doing: it collects the daily records, connects them together, and turns them into useful business answers.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {explainers.map(([title, description], index) => (
            <article key={title} className="landing-card rounded-lg border border-white/80 bg-white/90 p-5 backdrop-blur" style={{ animationDelay: `${index * 65}ms` }}>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-[#e7f4ec] font-semibold text-[#0d6b43]">{index + 1}</span>
                <h3 className="text-xl font-semibold">{title}</h3>
              </div>
              <p className="leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="workflow" className="landing-section landing-motion-soft bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase text-[#0d6b43]">Workflow</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">A simple flow for running the business day by day.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">The app is not supposed to feel complicated. You start with setup, add your real records, then let the dashboard show what changed.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {workflow.map(([step, description], index) => (
              <div key={step} className="landing-step rounded-lg border border-[#d8e3d9] bg-[#f8faf7] p-5">
                <p className="text-sm font-semibold text-[#0d6b43]">Step {index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold">{step}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="landing-section landing-motion-split mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-start">
          <div className="sticky top-24 rounded-lg border border-white/80 bg-[#101915] p-6 text-white shadow-xl">
            <p className="text-sm font-semibold uppercase text-emerald-200">Routes inside OgaBiz</p>
            <h2 className="mt-3 text-3xl font-semibold">Every page has a real job.</h2>
            <p className="mt-4 leading-7 text-emerald-50">
              The app is not just a dashboard. Each route handles one part of the business, then the dashboard brings the numbers together.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {routes.map(([route, description], index) => (
              <div key={route} className="landing-step rounded-lg border border-[#d8e3d9] bg-white/92 p-5" style={{ animationDelay: `${index * 55}ms` }}>
                <h3 className="text-lg font-semibold">{route}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="ai" className="landing-section landing-motion-glow bg-[#e7f4ec] py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-[#0d6b43]">OgaBiz Assistant</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">The AI should explain your business, not guess your business.</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              As the app grows, the assistant can help you ask business questions in normal language. The important part is that its answers should come from your own records.
            </p>
          </div>
          <div className="grid gap-4">
            {aiSteps.map(([title, description], index) => (
              <div key={title} className="landing-card rounded-lg border border-white/90 bg-white/90 p-5" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-[#101915] p-2 text-white"><Bot className="size-5" /></span>
                  <h3 className="text-xl font-semibold">{title}</h3>
                </div>
                <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="landing-section landing-motion-pop mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {["Traders and shop owners", "Wholesalers and retailers", "Online vendors and service businesses"].map((item) => <div key={item} className="rounded-lg bg-[#101915] p-6 text-white shadow-sm">{item}<p className="mt-3 text-sm text-emerald-100">Clear records, simple actions, better decisions.</p></div>)}
        </div>
      </section>
      <section className="landing-section landing-motion-stack mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><CardTitle>Less guessing</CardTitle></CardHeader><CardContent className="text-muted-foreground">Know what is selling, what is low, who owes money, and where cash is going.</CardContent></Card>
          <Card><CardHeader><CardTitle>Cleaner records</CardTitle></CardHeader><CardContent className="text-muted-foreground">Keep products, customers, and expenses connected to one business account.</CardContent></Card>
          <Card><CardHeader><CardTitle>Ready to grow</CardTitle></CardHeader><CardContent className="text-muted-foreground">Start simple now, then add reports, staff, and AI guidance as the product grows.</CardContent></Card>
        </div>
      </section>
      <section id="faq" className="landing-section landing-motion-faq mx-auto max-w-4xl scroll-mt-24 px-4 py-20 sm:px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-[#0d6b43]">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Questions before you start.</h2>
        </div>
        {faqs.map(([question, answer]) => (
          <details key={question} className="landing-faq border-b border-[#d8e3d9] py-5">
            <summary className="cursor-pointer text-lg font-medium">{question}</summary>
            <p className="mt-3 leading-7 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </section>
      <footer className="landing-footer relative z-10 border-t border-white/70 bg-[#101915] px-4 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 sm:px-6 md:grid-cols-[1.2fr_.8fr_.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-md bg-[#2fbd75] text-lg font-bold">O</span>
              <span className="landing-brand landing-brand-footer text-xl font-semibold"><span>OgaBiz</span> <span>AI</span></span>
            </div>
            <p className="mt-4 max-w-md leading-7 text-emerald-50">
              A clear business workspace for recording sales, stock, customers, debts, expenses, reports, and AI guidance in one place.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Product</h3>
            <div className="mt-4 grid gap-3 text-sm text-emerald-50">
              <a href="#features">Features</a>
              <a href="#learn">How it works</a>
              <a href="#workflow">Workflow</a>
              <a href="#ai">AI assistant</a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Start</h3>
            <div className="mt-4 grid gap-3 text-sm text-emerald-50">
              <button type="button" className="text-left" onClick={() => go("register")}>Create account</button>
              <button type="button" className="text-left" onClick={() => go("login")}>Sign in</button>
              <a href="#faq">Questions</a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-5 text-sm text-emerald-100 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>OgaBiz AI. Built for clear daily business control.</span>
          <span>Sales. Stock. Debts. Profit. Decisions.</span>
        </div>
      </footer>
    </main>
  );
}

function Auth({ title, action, onSubmit, go, register, forgot }: { title: string; action: string; onSubmit: (values: Record<string, string>) => void | Promise<void>; go: (view: View) => void; register?: boolean; forgot?: boolean }) {
  const [submitting, setSubmitting] = useState(false);
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader><CardTitle className="text-2xl">{title}</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={async (event) => { event.preventDefault(); setSubmitting(true); const data = new FormData(event.currentTarget); try { await onSubmit(Object.fromEntries(data.entries()) as Record<string, string>); } finally { setSubmitting(false); } }}>
            {register && <Field label="Full name" />}
            <Field label="Email" type="email" />
            {register && <Field label="Phone number" />}
            {!forgot && <Field label="Password" type="password" />}
            {register && <Field label="Confirm password" type="password" />}
            <Button className="w-full" type="submit" disabled={submitting}>{submitting ? `${action}...` : action}</Button>
          </form>
          <div className="mt-5 flex justify-between text-sm">
            <button type="button" className="text-primary" onClick={() => go("landing")}>Home</button>
            {!register && !forgot && <button type="button" className="text-primary" onClick={() => go("forgot")}>Forgot password?</button>}
            <button type="button" className="text-primary" onClick={() => go(register ? "login" : "register")}>{register ? "Sign in" : "Create account"}</button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Onboarding({ state, setState, onDone }: { state: AppState; setState: Dispatch<SetStateAction<AppState>>; onDone: (business: Business) => void | Promise<void> }) {
  const [draft, setDraft] = useState<Business>(state.business);
  const update = (key: keyof Business, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const completeSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const business = { ...draft, name: draft.name.trim(), currency: "NGN" };
    setState((current) => ({ ...current, business }));
    await onDone(business);
  };

  return (
    <main className="min-h-screen bg-[#f4f6f2] p-4 text-[#101915] sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <section className="rounded-lg bg-[#101915] p-6 text-white shadow-sm">
          <div className="grid size-12 place-items-center rounded-md bg-[#2fbd75] text-xl font-bold">O</div>
          <h1 className="mt-6 text-3xl font-semibold">Set up your business workspace.</h1>
          <p className="mt-4 leading-7 text-emerald-50">
            Add the basic details once. After this, OgaBiz opens your dashboard and keeps your products, sales, expenses, customers, debts, reports, and AI assistant connected to this business.
          </p>
          <div className="mt-6 space-y-3 text-sm text-emerald-50">
            {["Account created", "Business profile", "Dashboard ready"].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-md bg-white/10 font-semibold">{index + 1}</span>
                {item}
              </div>
            ))}
          </div>
        </section>
        <Card className="w-full rounded-lg border-[#d8e3d9] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Business setup</CardTitle>
          <p className="text-sm text-muted-foreground">Use the real business information you want to see on your dashboard and records.</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={completeSetup}>
            <Field label="Business name" defaultValue={draft.name} onChange={(v) => update("name", v)} />
            <SelectField label="Business type" options={businessTypes} defaultValue={draft.type} onChange={(v) => update("type", v)} />
            <Field label="Phone number" defaultValue={draft.phone || state.user.phone} onChange={(v) => update("phone", v)} />
            <Field label="Owner email" type="email" defaultValue={draft.email || state.user.email} onChange={(v) => update("email", v)} />
            <Field label="Business location" defaultValue={draft.location} onChange={(v) => update("location", v)} />
            <SelectField label="Currency" options={["NGN - Nigerian Naira"]} defaultValue="NGN - Nigerian Naira" onChange={() => update("currency", "NGN")} />
            <div className="md:col-span-2"><Field label="Business description" defaultValue={draft.description} textarea onChange={(v) => update("description", v)} /></div>
            {!draft.name.trim() && <p className="text-sm text-amber-700 md:col-span-2">Enter your business name to continue.</p>}
            <Button className="h-11 md:col-span-2" type="submit" disabled={!draft.name.trim()}>Go to dashboard</Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </main>
  );
}

function Sidebar({ collapsed, current, mobileOpen, onClose, onNavigate, onLogout }: { collapsed: boolean; current: View; mobileOpen: boolean; onClose: () => void; onNavigate: (view: View) => void; onLogout: () => void }) {
  const showLabels = mobileOpen || !collapsed;
  const scrollMenu = (event: KeyboardEvent<HTMLElement>) => {
    const panel = event.currentTarget;
    const moves: Record<string, number> = {
      ArrowDown: 64,
      ArrowUp: -64,
      PageDown: panel.clientHeight * 0.8,
      PageUp: panel.clientHeight * -0.8,
    };
    if (event.key === "Home") {
      event.preventDefault();
      panel.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
      return;
    }
    if (moves[event.key]) {
      event.preventDefault();
      panel.scrollBy({ top: moves[event.key], behavior: "smooth" });
    }
  };
  return (
    <>
      {mobileOpen && <button aria-label="Close menu backdrop" className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} />}
      <aside className={`fixed bottom-0 left-0 top-0 z-50 flex max-h-dvh flex-col overflow-hidden overscroll-contain bg-sidebar text-sidebar-foreground shadow-xl outline-none transition-all duration-200 ${collapsed ? "md:w-20" : "md:w-64"} ${mobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full md:translate-x-0"}`}>
        <div className="shrink-0 flex items-center justify-between border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-md bg-sidebar-primary font-bold text-white">O</span>{showLabels && <span className="font-semibold">OgaBiz AI</span>}</div>
          <button className="md:hidden" onClick={onClose} aria-label="Close menu"><X /></button>
        </div>
        <nav tabIndex={0} onKeyDown={scrollMenu} className="sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto p-3 outline-none">
          {navItems.map(([key, Icon, label]) => (
            <button key={key} onClick={() => onNavigate(key)} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition-colors hover:bg-sidebar-accent/70 focus-visible:bg-sidebar-accent/70 focus-visible:outline-none">
              <Icon className="size-5" />{showLabels && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="m-3 flex shrink-0 items-center gap-3 rounded-md px-3 py-3 text-sm hover:bg-sidebar-accent"><DoorOpen className="size-5" />{showLabels && "Logout"}</button>
      </aside>
    </>
  );
}

function AppHeader({ current, state, onMenu, onSidebarToggle, sidebarCollapsed, onQuickSale, onProfile, onLogout }: { current: View; state: AppState; onMenu: () => void; onSidebarToggle: () => void; sidebarCollapsed: boolean; onQuickSale: () => void; onProfile: () => void; onLogout: () => void }) {
  const currentLabel = navItems.find(([key]) => key === current)?.[2] || "Dashboard";
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const initials = (state.user.fullName || state.business.name || "O")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="dashboard-header sticky top-0 z-30 border-b border-white/70 bg-white/88 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open menu"
            className="grid size-10 place-items-center rounded-md border bg-white text-foreground shadow-sm md:hidden"
            onClick={onMenu}
          >
            <Menu className="size-5" />
          </button>
          <button
            aria-label={sidebarCollapsed ? "Open menu" : "Close menu"}
            className="hidden size-10 place-items-center rounded-md border bg-white text-foreground shadow-sm transition hover:bg-[#f4f6f2] md:grid"
            onClick={onSidebarToggle}
          >
            {sidebarCollapsed ? <Menu className="size-5" /> : <X className="size-5" />}
          </button>
          <div className="hidden size-11 place-items-center rounded-lg bg-[#101915] text-sm font-bold text-white shadow-sm sm:grid">
            O
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#0d6b43]">{state.business.name || "OgaBiz workspace"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold sm:text-2xl">{currentLabel}</h1>
              <span className="hidden rounded-md bg-[#e7f4ec] px-2 py-1 text-xs font-medium text-[#0d6b43] sm:inline-flex">{today}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="dashboard-header-button hidden sm:inline-flex" onClick={onQuickSale}>Record Sale</Button>
          <Button variant="outline" className="dashboard-header-button hidden sm:inline-flex gap-2" onClick={onLogout}>
            <DoorOpen className="size-4" />
            Logout
          </Button>
          <Button variant="outline" size="icon" className="dashboard-header-button sm:hidden" aria-label="Logout" onClick={onLogout}>
            <DoorOpen className="size-4" />
          </Button>
          <button type="button" className="dashboard-profile-chip group flex items-center gap-2 rounded-md border px-2 py-1.5 text-left shadow-sm" onClick={onProfile} aria-label="Open profile">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-sm font-semibold text-white transition group-hover:bg-[#0a5737]">
              {initials}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-xs font-medium text-muted-foreground">My Profile</span>
              <span className="block max-w-28 truncate text-sm font-semibold text-[#101915]">{state.user.fullName || state.business.name || "Account"}</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function ProfileHomeHeader({ state, onDashboard, onLogout }: { state: AppState; onDashboard: () => void; onLogout: () => void }) {
  const initials = (state.user.fullName || state.business.name || "O")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="profile-home-header sticky top-0 z-30">
      <div className="profile-home-header-inner mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="profile-avatar grid size-11 place-items-center rounded-lg text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#0d6b43]">{state.business.name || "OgaBiz workspace"}</p>
            <h1 className="truncate text-xl font-semibold text-[#101915] sm:text-2xl">My Profile</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="profile-header-primary" onClick={onDashboard}>
            <LayoutDashboard className="size-4" />
            <span className="hidden sm:inline">Enter Dashboard</span>
          </Button>
          <Button variant="outline" className="profile-header-secondary" onClick={onLogout} aria-label="Logout">
            <DoorOpen className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function ProfilePage({ state, go }: { state: AppState; go: (view: View) => void }) {
  const t = totals(state);
  const initials = (state.user.fullName || state.business.name || "O")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const profileRows = [
    ["Full name", state.user.fullName || "Not added yet"],
    ["Email", state.user.email || "Not added yet"],
    ["Phone", state.user.phone || "Not added yet"],
    ["Business", state.business.name || "Not added yet"],
    ["Business type", state.business.type || "Not added yet"],
    ["Location", state.business.location || "Not added yet"],
  ];
  const stats = [
    ["Products", String(state.products.length), "Inventory items saved", Boxes, "inventory"],
    ["Customers", String(state.customers.length), "Customer profiles saved", Users, "customers"],
    ["Sales", money(t.revenue), "Revenue recorded", ShoppingCart, "sales"],
    ["Profit", money(t.netProfit), "Open the dashboard summary", BadgeDollarSign, "dashboard"],
  ] as const;
  const chartItems = [
    { label: "Sales", value: Math.max(t.revenue, 0), color: "#0d6b43" },
    { label: "Expenses", value: Math.max(t.expenses, 0), color: "#d39a25" },
    { label: "Debts", value: Math.max(t.debt, 0), color: "#2563a8" },
    { label: "Stock", value: Math.max(state.products.length, 0), color: "#7b5bb6" },
  ];
  const chartTotal = chartItems.reduce((sum, item) => sum + item.value, 0);
  let chartCursor = 0;
  const chartGradient = chartTotal
    ? chartItems
        .map((item) => {
          const start = chartCursor;
          chartCursor += (item.value / chartTotal) * 100;
          return `${item.color} ${start}% ${chartCursor}%`;
        })
        .join(", ")
    : "#dfe5dc 0% 100%";

  return (
    <Page title="My Profile" subtitle="Your personal account and business workspace before you enter the dashboard.">
      <section className="profile-hero profile-scroll-reveal dashboard-summary overflow-hidden rounded-lg border bg-white">
        <div className="profile-photo-scene grid gap-5 p-4 sm:p-6 lg:grid-cols-[.82fr_1.18fr]">
          <div className="profile-owner-card rounded-lg bg-[#101915] p-5 text-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="grid size-20 place-items-center rounded-lg bg-[#2fb86e] text-2xl font-bold shadow-inner">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-emerald-100">Account owner</p>
                <h2 className="mt-1 truncate text-2xl font-semibold">{state.user.fullName || "OgaBiz user"}</h2>
                <p className="mt-1 truncate text-sm text-emerald-100">{state.user.email || "Add your email in settings"}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="rounded-md border border-white/10 bg-white/8 p-3">
                <p className="text-emerald-100">Workspace</p>
                <p className="mt-1 font-semibold">{state.business.name || "Business account"}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/8 p-3">
                <p className="text-emerald-100">Status</p>
                <p className="mt-1 font-semibold">Active business profile</p>
              </div>
            </div>
            <Button className="profile-enter-button mt-5 w-full" onClick={() => go("dashboard")}>
              Enter dashboard
            </Button>
          </div>
          <Card className="dashboard-card profile-detail-card rounded-lg">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {profileRows.map(([label, value]) => (
                <div key={label} className="rounded-md border bg-[#f8faf7] p-3">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 break-words font-semibold">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="profile-scroll-reveal grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, detail, Icon, target], index) => (
          <Metric key={label} label={label} value={value} detail={detail} icon={<Icon className="size-5" />} index={index} onClick={() => go(target)} actionLabel={`Open ${label}`} />
        ))}
      </div>

      <div className="profile-scroll-reveal grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <Card className="dashboard-card rounded-lg">
          <CardHeader>
            <CardTitle>Live Business Chart</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-[.8fr_1.2fr] md:items-center">
            <div className="mx-auto grid size-48 place-items-center rounded-full shadow-xl" style={{ background: `conic-gradient(${chartGradient})` }}>
              <div className="grid size-28 place-items-center rounded-full bg-white text-center shadow-inner">
                <div>
                  <p className="text-xs text-muted-foreground">Live total</p>
                  <p className="text-lg font-semibold">{chartTotal ? money(chartTotal) : "No data"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {chartItems.map((item) => (
                <button key={item.label} type="button" className="flex w-full items-center justify-between rounded-md border bg-[#f8faf7] p-3 text-left transition hover:border-[#0d6b43]/30 hover:bg-[#e7f4ec]" onClick={() => go(item.label === "Sales" ? "sales" : item.label === "Expenses" ? "expenses" : item.label === "Debts" ? "debts" : "inventory")}>
                  <span className="flex items-center gap-2">
                    <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                  </span>
                  <span className="font-semibold">{item.label === "Stock" ? String(item.value) : money(item.value)}</span>
                </button>
              ))}
              <FocusRow label="Products low in stock" value={String(t.lowStock)} />
              <FocusRow label="Customers saved" value={String(state.customers.length)} />
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card rounded-lg">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="profile-step-button justify-start gap-3" onClick={() => go("dashboard")}><LayoutDashboard className="size-4" /> Enter dashboard</Button>
            <Button variant="outline" className="profile-step-button justify-start gap-3" onClick={() => go("settings")}><Settings className="size-4" /> Update profile</Button>
            <Button variant="outline" className="profile-step-button justify-start gap-3" onClick={() => go("inventory")}><PackagePlus className="size-4" /> Add product</Button>
            <Button variant="outline" className="profile-step-button justify-start gap-3" onClick={() => go("sales")}><ShoppingCart className="size-4" /> Record sale</Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}

function Dashboard({ state, go }: { state: AppState; go: (view: View) => void }) {
  const t = totals(state);
  const firstName = state.user.fullName.split(" ")[0] || "there";
  const lowStock = state.products.filter((product) => stockStatus(product) !== "In Stock");
  const owing = state.debts.filter((debt) => debt.amountOwed > debt.amountPaid);
  const recentSales = state.sales.slice(0, 4);
  const recentExpenses = state.expenses.slice(0, 4);
  const bestProduct = [...state.sales].sort((a, b) => b.quantity - a.quantity)[0];
  const setupSteps = [
    { label: "Add your first product", done: state.products.length > 0, target: "inventory" as View },
    { label: "Add a customer", done: state.customers.length > 0, target: "customers" as View },
    { label: "Record a sale", done: state.sales.length > 0, target: "sales" as View },
    { label: "Record an expense", done: state.expenses.length > 0, target: "expenses" as View },
  ];
  const completedSteps = setupSteps.filter((step) => step.done).length;
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const cards = [
    ["Sales", money(t.revenue), "All recorded sales", ShoppingCart, "sales"],
    ["Expenses", money(t.expenses), "Operating costs", ReceiptText, "expenses"],
    ["Net Profit", money(t.netProfit), "Open detailed reports", BadgeDollarSign, "reports"],
    ["Customer Debt", money(t.debt), `${owing.length} open balance${owing.length === 1 ? "" : "s"}`, WalletCards, "debts"],
    ["Products", String(t.totalProducts), `${t.lowStock} low stock`, Boxes, "inventory"],
    ["Customers", String(state.customers.length), "Saved customer profiles", Users, "customers"],
  ] as const;

  return (
    <div className="dashboard-shell mx-auto flex max-w-7xl flex-col gap-5">
      <section className="dashboard-summary overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.25fr_.75fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{today}</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>{state.business.type || "Business"}</span>
            </div>
            <h2 className="mt-3 max-w-3xl text-2xl font-semibold leading-tight sm:text-3xl">
              Good to see you, {firstName}.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {state.business.name || "Your business"} has {state.products.length} products, {state.customers.length} customers, and {owing.length} open customer balance{owing.length === 1 ? "" : "s"}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" className="dashboard-header-button" onClick={() => go("sales")}>Record sale</Button>
              <Button variant="outline" className="dashboard-header-button" onClick={() => go("inventory")}>Add product</Button>
              <Button variant="outline" className="dashboard-header-button" onClick={() => go("expenses")}>Add expense</Button>
            </div>
          </div>
          <div className="rounded-lg border bg-[#f7faf7] p-4">
            <p className="text-sm text-muted-foreground">Cash position</p>
            <p className="mt-2 text-2xl font-semibold">{money(t.netProfit)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-muted-foreground">Revenue</p>
                <p className="mt-1 font-semibold">{money(t.revenue)}</p>
              </div>
              <div className="rounded-md bg-white p-3 shadow-sm">
                <p className="text-muted-foreground">Debt</p>
                <p className="mt-1 font-semibold">{money(t.debt)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {completedSteps < setupSteps.length && (
        <Card className="dashboard-card rounded-lg border-[#d8e3d9] bg-white">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Start with these records</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Complete these steps once and your dashboard will begin showing real movement.</p>
              </div>
              <p className="text-sm font-semibold text-primary">{completedSteps} of {setupSteps.length} done</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            {setupSteps.map((step) => (
              <button key={step.label} onClick={() => go(step.target)} className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${step.done ? "border-emerald-200 bg-emerald-50" : "border-[#d8e3d9] bg-[#f8faf7]"}`}>
                <span className={`grid size-8 place-items-center rounded-md text-sm font-semibold ${step.done ? "bg-emerald-600 text-white" : "bg-white text-primary"}`}>{step.done ? <Check className="size-4" /> : <Plus className="size-4" />}</span>
                <p className="mt-3 font-medium">{step.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.done ? "Completed" : "Open"}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, detail, Icon, target], index) => (
          <Metric key={label} label={label} value={value} detail={detail} icon={<Icon className="size-5" />} index={index} onClick={() => go(target)} actionLabel={`Open ${label}`} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
        <Card className="dashboard-card rounded-lg">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Sales Overview</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Revenue movement from your saved sales</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Today", "7 Days", "30 Days"].map((filter) => <Button key={filter} variant="outline" size="sm" className="dashboard-header-button">{filter}</Button>)}
              </div>
            </div>
          </CardHeader>
          <CardContent><MiniChart sales={state.sales} /></CardContent>
        </Card>
        <Card className="dashboard-card rounded-lg">
          <CardHeader>
            <CardTitle>Today’s Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <FocusRow label="Best seller" value={bestProduct?.productName || "No sales yet"} />
            <FocusRow label="Low stock" value={lowStock.length ? `${lowStock.length} product${lowStock.length === 1 ? "" : "s"}` : "All stocked"} />
            <FocusRow label="Outstanding debts" value={owing.length ? money(t.debt) : "None"} />
            <FocusRow label="Recent expense" value={recentExpenses[0] ? `${recentExpenses[0].name} - ${money(recentExpenses[0].amount)}` : "No expenses yet"} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <List title="Recent Sales" items={recentSales.map((sale) => `${sale.productName} - ${money(saleRevenue(sale))}`)} empty="No sales recorded yet." action="Record Your First Sale" onAction={() => go("sales")} />
        <List title="Recent Expenses" items={recentExpenses.map((expense) => `${expense.name} - ${money(expense.amount)}`)} empty="No expenses recorded yet." action="Add Expense" onAction={() => go("expenses")} />
        <List title="Low Stock Alerts" items={lowStock.map((product) => `${product.name} - ${product.quantity} ${product.unit} left`)} empty="No low stock alerts." action="Add Product" onAction={() => go("inventory")} />
        <List title="Customers Owing Money" items={owing.map((debt) => `${debt.customerName} - ${money(debt.amountOwed - debt.amountPaid)}`)} empty="No outstanding debt." action="Add Customer" onAction={() => go("customers")} />
      </div>

      <Card className="dashboard-card rounded-lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Add Sale", "sales", ShoppingCart],
            ["Add Product", "inventory", PackagePlus],
            ["Add Expense", "expenses", ReceiptText],
            ["Add Customer", "customers", Users],
            ["Record Payment", "debts", WalletCards],
            ["Ask OgaBiz AI", "assistant", Bot],
          ].map(([label, target, Icon]) => (
            <Button key={String(label)} variant="outline" className="dashboard-header-button h-14 justify-start gap-3" onClick={() => go(target as View)}>
              <Icon className="size-5" />
              {label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Inventory({ state, setState, setNotice, backendReady }: SectionProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockAmounts, setStockAmounts] = useState<Record<string, string>>({});
  const products = state.products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()) && (!category || p.category === category));
  const productFields = ["Product name", "SKU", "Category", "Description", "Cost price", "Selling price", "Quantity in stock", "Low-stock threshold", "Unit"];
  const valuesToProduct = (values: Record<string, string>, id = newId("prd")): Product => ({
    id,
    name: values["Product name"],
    sku: values.SKU,
    category: values.Category,
    description: values.Description,
    costPrice: +values["Cost price"],
    sellingPrice: +values["Selling price"],
    quantity: +values["Quantity in stock"],
    lowStockThreshold: +values["Low-stock threshold"],
    unit: values.Unit || "Piece",
  });
  const productPayload = (product: Product) => ({
    name: product.name,
    sku: product.sku,
    category: product.category,
    description: product.description,
    costPrice: product.costPrice,
    sellingPrice: product.sellingPrice,
    quantity: product.quantity,
    lowStockThreshold: product.lowStockThreshold,
    unit: product.unit,
  });
  return (
    <Page title="Inventory" subtitle="Add products, manage stock, and see low-stock status.">
      <DataForm title="Add product" fields={productFields} onSubmit={async (values) => {
        const product = valuesToProduct(values);
        try {
          const data = await saveRecord("/api/products", productPayload(product));
          const savedProduct = data.product?._id ? { ...product, id: String(data.product._id) } : product;
          setState((s) => ({ ...s, products: [savedProduct, ...s.products], activityLog: [`${s.user.fullName.split(" ")[0]} added ${product.quantity} units of ${product.name}.`, ...s.activityLog] }));
          setNotice("Product saved. You can edit it or add more stock below.");
        } catch (error) {
          setNotice(error instanceof Error ? error.message : "Product was not saved. Make sure the backend is running.");
          return false;
        }
      }} />
      {editingProduct && (
        <DataForm
          key={editingProduct.id}
          title={`Update ${editingProduct.name}`}
          fields={productFields}
          defaults={{
            "Product name": editingProduct.name,
            SKU: editingProduct.sku,
            Category: editingProduct.category,
            Description: editingProduct.description,
            "Cost price": String(editingProduct.costPrice),
            "Selling price": String(editingProduct.sellingPrice),
            "Quantity in stock": String(editingProduct.quantity),
            "Low-stock threshold": String(editingProduct.lowStockThreshold),
            Unit: editingProduct.unit,
          }}
          onSubmit={async (values) => {
            const product = valuesToProduct(values, editingProduct.id);
            try {
              if (!state.products.some((item) => item.id === editingProduct.id)) {
                setEditingProduct(null);
                setNotice("This product was already deleted. Choose another product to edit.");
                return false;
              }
              const data = await saveRecord(`/api/products/${editingProduct.id}`, productPayload(product), "PATCH");
              const savedProduct = data.product?._id ? { ...product, id: String(data.product._id) } : product;
              setState((s) => ({ ...s, products: s.products.map((item) => item.id === editingProduct.id ? savedProduct : item) }));
              setEditingProduct(null);
              setNotice(`${product.name} updated.`);
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Product was not updated.");
              return false;
            }
          }}
        />
      )}
      <Filters search={search} setSearch={setSearch} category={category} setCategory={setCategory} categories={[...new Set(state.products.map((p) => p.category))]} />
      {products.length ? <Card className="rounded-lg"><CardContent className="overflow-x-auto pt-6"><Table><TableHeader><TableRow>{["Product","Category","Cost price","Selling price","Current stock","Stock status","Actions"].map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>{products.map((p) => <TableRow key={p.id}><TableCell>{p.name}<p className="text-xs text-muted-foreground">{p.sku}</p></TableCell><TableCell>{p.category}</TableCell><TableCell>{money(p.costPrice)}</TableCell><TableCell>{money(p.sellingPrice)}</TableCell><TableCell>{p.quantity} {p.unit}</TableCell><TableCell>{stockStatus(p)}</TableCell><TableCell><div className="flex min-w-[280px] flex-wrap gap-2"><Input className="h-9 w-24" min="1" type="number" placeholder="Qty" value={stockAmounts[p.id] || ""} onChange={(event) => setStockAmounts((current) => ({ ...current, [p.id]: event.target.value }))} /><Button size="sm" variant="outline" onClick={async () => { const quantity = Number(stockAmounts[p.id] || 0); if (!quantity || quantity < 1) { setNotice("Enter the stock quantity you want to add."); return; } try { const data = await saveRecord(`/api/products/${p.id}/add-stock`, { quantity }, "PATCH"); const savedQuantity = Number(data.product?.quantity ?? p.quantity + quantity); setState((s) => ({ ...s, products: s.products.map((item) => item.id === p.id ? { ...item, quantity: savedQuantity } : item), activityLog: [`${s.user.fullName.split(" ")[0]} added ${quantity} ${p.unit} to ${p.name}.`, ...s.activityLog] })); setStockAmounts((current) => ({ ...current, [p.id]: "" })); setNotice(`Added ${quantity} ${p.unit.toLowerCase()} to ${p.name}.`); } catch (error) { setNotice(error instanceof Error ? error.message : "Stock was not updated."); } }}>Add Stock</Button><Button size="sm" variant="outline" onClick={() => setEditingProduct(p)}>Edit</Button><Button size="sm" variant="destructive" onClick={async () => { try { await saveRecord(`/api/products/${p.id}`, {}, "DELETE"); setState((s) => ({ ...s, products: s.products.filter((item) => item.id !== p.id) })); setStockAmounts((current) => { const next = { ...current }; delete next[p.id]; return next; }); if (editingProduct?.id === p.id) setEditingProduct(null); setNotice(`${p.name} removed from inventory.`); } catch (error) { setNotice(error instanceof Error ? error.message : "Product was not deleted."); } }}>Delete</Button></div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card> : <Empty text="Your inventory is empty." button="Add Your First Product" />}
    </Page>
  );
}

function Sales({ state, setState, setNotice, backendReady }: SectionProps) {
  return <Page title="Sales" subtitle="Record sales and automatically reduce product quantity."><DataForm title="Record sale" fields={["Product", "Quantity", "Selling price", "Customer optional", "Payment method", "Payment status", "Date", "Notes"]} defaults={{ Product: state.products[0]?.name || "", Date: new Date().toISOString().slice(0, 10), "Payment method": "Cash", "Payment status": "Paid" }} options={{ Product: state.products.map((product) => product.name), "Customer optional": ["Walk-in customer", ...state.customers.map((customer) => customer.name)], "Payment method": paymentMethods, "Payment status": ["Paid", "Partially Paid", "Unpaid"] }} onSubmit={async (v) => {
    const product = state.products.find((p) => p.name === v.Product) || state.products[0];
    const quantity = +v.Quantity;
    if (!product || product.quantity - quantity < 0) { setNotice("Inventory cannot become negative. Add stock before recording this sale."); return; }
    if (!quantity || quantity < 1) { setNotice("Enter a valid quantity before recording the sale."); return; }
    const customer = state.customers.find((c) => c.name === v["Customer optional"]);
    const sellingPrice = +v["Selling price"] || product.sellingPrice;
    const revenue = quantity * sellingPrice;
    const paymentStatus = (v["Payment status"] || "Paid") as Sale["paymentStatus"];
    const amountPaid = paymentStatus === "Paid" ? revenue : paymentStatus === "Unpaid" ? 0 : Math.round(revenue / 2);
    const sale: Sale = { id: newId("sale"), productId: product.id, productName: product.name, quantity, sellingPrice, costPrice: product.costPrice, customerId: customer?.id, customerName: customer?.name, paymentMethod: v["Payment method"] || "Cash", paymentStatus, amountPaid, date: v.Date, notes: v.Notes };
    const balance = revenue - amountPaid;
    const debt: Debt | null = balance > 0 && customer ? { id: newId("debt"), customerId: customer.id, customerName: customer.name, amountOwed: revenue, amountPaid, dateCreated: sale.date, dueDate: sale.date, description: `Balance for ${product.name} sale`, payments: amountPaid > 0 ? [{ id: newId("pay"), amount: amountPaid, date: sale.date, notes: "Initial payment" }] : [] } : null;
    try {
      const data = await saveRecord("/api/sales", { productId: product.id, customerId: customer?.id, quantity, sellingPrice, amountPaid, paymentMethod: sale.paymentMethod, paymentStatus, date: sale.date, notes: sale.notes });
      const savedSale = data.sale?._id ? { ...sale, id: String(data.sale._id) } : sale;
      const savedDebt = data.debt?._id && debt ? { ...debt, id: String(data.debt._id) } : debt;
      setState((s) => ({ ...s, sales: [savedSale, ...s.sales], debts: savedDebt ? [savedDebt, ...s.debts] : s.debts, products: s.products.map((p) => p.id === product.id ? { ...p, quantity: p.quantity - quantity } : p), activityLog: [`${s.user.fullName.split(" ")[0]} recorded a ${money(saleRevenue(sale))} sale.`, ...s.activityLog] }));
      setNotice(debt ? "Sale saved to MongoDB, inventory reduced, and customer debt created." : "Sale saved to MongoDB and inventory reduced.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Sale was not saved. Make sure the backend is running.");
    }
  }} /><List title="Sales history" items={state.sales.map((s) => `${s.productName} x${s.quantity} - ${money(saleRevenue(s))} - ${s.paymentStatus}`)} empty="No sales recorded yet." action="Record Your First Sale" /></Page>;
}

function Expenses({ state, setState, setNotice, backendReady }: SectionProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const expenses = state.expenses.filter((e) => `${e.name} ${e.category}`.toLowerCase().includes(search.toLowerCase()) && (!category || e.category === category));
  return <Page title="Expenses" subtitle="Track operating costs separately from product cost."><DataForm title="Add expense" fields={["Expense name", "Category", "Amount", "Date", "Payment method", "Notes"]} defaults={{ Date: new Date().toISOString().slice(0, 10), Category: "Transportation", "Payment method": "Cash" }} options={{ Category: expenseCategories, "Payment method": paymentMethods }} onSubmit={async (v) => { const expense: Expense = { id: newId("exp"), name: v["Expense name"], category: v.Category, amount: +v.Amount, date: v.Date, paymentMethod: v["Payment method"], notes: v.Notes }; if (!expense.name || !expense.amount) { setNotice("Enter an expense name and amount."); return; } try { const data = await saveRecord("/api/expenses", expense); const savedExpense = data.expense?._id ? { ...expense, id: String(data.expense._id) } : expense; setState((s) => ({ ...s, expenses: [savedExpense, ...s.expenses], activityLog: [`${s.user.fullName.split(" ")[0]} recorded ${money(expense.amount)} ${expense.category.toLowerCase()} expense.`, ...s.activityLog] })); setNotice("Expense saved to MongoDB."); } catch (error) { setNotice(error instanceof Error ? error.message : "Expense was not saved. Make sure the backend is running."); } }} /><Filters search={search} setSearch={setSearch} category={category} setCategory={setCategory} categories={expenseCategories} /><List title="Expense records" items={expenses.map((e) => `${e.name} - ${e.category} - ${money(e.amount)}`)} empty="No expenses recorded yet." action="Add expense" /></Page>;
}

function Customers({ state, setState, setNotice, backendReady }: SectionProps) {
  const [search, setSearch] = useState("");
  const customers = state.customers.filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(search.toLowerCase()));
  return <Page title="Customers" subtitle="Keep customer profiles, purchases and debt context together."><DataForm title="Add customer" fields={["Customer name", "Phone", "Email optional", "Address optional", "Notes"]} onSubmit={async (v) => { const customer: Customer = { id: newId("cus"), name: v["Customer name"], phone: v.Phone, email: v["Email optional"], address: v["Address optional"], notes: v.Notes }; try { const data = await saveRecord("/api/customers", customer); const savedCustomer = data.customer?._id ? { ...customer, id: String(data.customer._id) } : customer; setState((s) => ({ ...s, customers: [savedCustomer, ...s.customers] })); setNotice("Customer saved to MongoDB."); } catch (error) { setNotice(error instanceof Error ? error.message : "Customer was not saved. Make sure the backend is running."); } }} /><div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search customers" value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="grid gap-4 md:grid-cols-2">{customers.map((c) => { const purchases = state.sales.filter((s) => s.customerId === c.id); const debts = state.debts.filter((d) => d.customerId === c.id); return <Card key={c.id} className="rounded-lg"><CardHeader><CardTitle>{c.name}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>{c.phone}</p><p>Total purchases: {money(purchases.reduce((sum, s) => sum + saleRevenue(s), 0))}</p><p>Amount paid: {money(purchases.reduce((sum, s) => sum + s.amountPaid, 0))}</p><p>Outstanding balance: {money(debts.reduce((sum, d) => sum + d.amountOwed - d.amountPaid, 0))}</p><p className="text-muted-foreground">Recent purchases: {purchases[0]?.productName || "None yet"}</p></CardContent></Card>; })}</div>{!customers.length && <Empty text="No customers yet." button="Add Customer" />}</Page>;
}

function Debts({ state, setState, setNotice, backendReady }: SectionProps) {
  return <Page title="Customer Debts" subtitle="Record money owed without deleting original transaction history."><DataForm title="Record debt" fields={["Customer", "Amount owed", "Amount paid", "Due date", "Description"]} defaults={{ Customer: state.customers[0]?.name || "", "Due date": new Date().toISOString().slice(0, 10) }} options={{ Customer: state.customers.map((customer) => customer.name) }} onSubmit={async (v) => { const customer = state.customers.find((c) => c.name === v.Customer) || state.customers[0]; if (!customer) { setNotice("Add a customer before recording debt."); return; } const debt: Debt = { id: newId("debt"), customerId: customer.id, customerName: customer.name, amountOwed: +v["Amount owed"], amountPaid: +v["Amount paid"], dateCreated: new Date().toISOString().slice(0, 10), dueDate: v["Due date"], description: v.Description, payments: +v["Amount paid"] > 0 ? [{ id: newId("pay"), amount: +v["Amount paid"], date: new Date().toISOString().slice(0, 10) }] : [] }; if (!debt.amountOwed) { setNotice("Enter the amount owed before saving debt."); return; } try { const data = await saveRecord("/api/debts", debt); const savedDebt = data.debt?._id ? { ...debt, id: String(data.debt._id) } : debt; setState((s) => ({ ...s, debts: [savedDebt, ...s.debts] })); setNotice("Debt saved to MongoDB."); } catch (error) { setNotice(error instanceof Error ? error.message : "Debt was not saved. Make sure the backend is running."); } }} /><div className="grid gap-4">{state.debts.map((d) => { const balance = d.amountOwed - d.amountPaid; return <Card key={d.id} className="rounded-lg"><CardContent className="grid gap-3 pt-6 md:grid-cols-[1fr_auto]"><div><h3 className="font-semibold">{d.customerName}</h3><p className="text-sm text-muted-foreground">{d.description}</p><p className="mt-2 text-sm">Original debt: {money(d.amountOwed)} | Paid: {money(d.amountPaid)} | Balance: {money(balance)} | {debtStatus(d)}</p><p className="text-sm text-muted-foreground">Payment history: {d.payments.map((p) => money(p.amount)).join(", ") || "No payment yet"}</p></div><Button variant="outline" disabled={balance <= 0} onClick={async () => { const amount = Math.min(5000, balance); if (backendReady) await saveRecord(`/api/debts/${d.id}/payments`, { amount, notes: "Recorded payment" }); setState((s) => ({ ...s, debts: s.debts.map((item) => item.id === d.id ? { ...item, amountPaid: item.amountPaid + amount, payments: [...item.payments, { id: newId("pay"), amount, date: new Date().toISOString().slice(0, 10), notes: "Recorded payment" }] } : item), activityLog: [`${s.user.fullName.split(" ")[0]} received ${money(amount)} from ${d.customerName}.`, ...s.activityLog] })); setNotice(`Debt payment of ${money(amount)} recorded.`); }}>Record NGN 5,000 Payment</Button></CardContent></Card>; })}</div></Page>;
}

function Reports({ state }: { state: AppState }) {
  const t = totals(state);
  const best = [...state.sales].sort((a, b) => b.quantity - a.quantity)[0];
  return <Page title="Reports" subtitle="Simple business reports for sales, expenses, profit, products, customers and debts."><div className="flex flex-wrap gap-2">{["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month", "Custom Date Range"].map((f) => <Button key={f} variant="outline" size="sm">{f}</Button>)}</div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Total sales" value={money(t.revenue)} /><Metric label="Total expenses" value={money(t.expenses)} /><Metric label="Gross profit" value={money(t.grossProfit)} /><Metric label="Estimated net profit" value={money(t.netProfit)} /></div><Card className="rounded-lg"><CardContent className="grid gap-6 pt-6 md:grid-cols-2"><MiniChart sales={state.sales} /><div className="space-y-3 text-sm"><p>Best-selling product: {best?.productName || "Not enough data"}</p><p>Low-performing products: {state.products.filter((p) => !state.sales.some((s) => s.productId === p.id)).map((p) => p.name).join(", ") || "None yet"}</p><p>Top customers: {state.customers.map((c) => c.name).join(", ") || "No customers yet"}</p><p>Outstanding debts: {money(t.debt)}</p><p>{state.sales.length ? "Sales by day and month are calculated from your saved sales." : "Record sales to see trends here."}</p></div></CardContent></Card></Page>;
}

type AiDraft =
  | { type: "sale"; product: Product; quantity: number; customer?: Customer; paymentStatus: Sale["paymentStatus"]; paymentMethod: string; amountPaid: number; notes: string }
  | { type: "expense"; name: string; category: string; amount: number; paymentMethod: string; notes: string };

function Assistant({ state, setState, setNotice, backendReady }: SectionProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("Ask about sales, profit, low stock, expenses, or customer debt.");
  const [draft, setDraft] = useState<AiDraft | null>(null);
  const findProduct = (text: string) => state.products.find((product) => text.toLowerCase().includes(product.name.toLowerCase()));
  const findCustomer = (text: string) => state.customers.find((customer) => text.toLowerCase().includes(customer.name.toLowerCase()));
  const extractAmount = (text: string) => {
    const match = text.replace(/,/g, "").match(/(?:ngn|₦|n)?\s*(\d+(?:\.\d+)?)/i);
    return match ? Number(match[1]) : 0;
  };
  const extractQuantity = (text: string) => {
    const match = text.match(/\b(\d+)\b/);
    return match ? Number(match[1]) : 0;
  };
  const prepareAction = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("sold") || lower.includes("sale") || lower.includes("sell")) {
      const product = findProduct(text);
      const quantity = extractQuantity(text);
      const customer = findCustomer(text);
      if (!product) return "I can record that sale after you add the product to inventory first.";
      if (!quantity || quantity < 1) return `How many ${product.name} did you sell? Try something like: I sold 3 ${product.name}.`;
      if (product.quantity - quantity < 0) return `${product.name} has only ${product.quantity} ${product.unit} left. Add stock before recording this sale.`;
      const revenue = product.sellingPrice * quantity;
      const draftSale: AiDraft = { type: "sale", product, quantity, customer, paymentStatus: "Paid", paymentMethod: "Cash", amountPaid: revenue, notes: `Created from OgaBiz AI: ${text}` };
      setDraft(draftSale);
      return `I found this sale:\n${quantity} x ${product.name}\nTotal: ${money(revenue)}\nCustomer: ${customer?.name || "Walk-in customer"}\n\nPlease confirm before I save it.`;
    }
    if (lower.includes("expense") || lower.includes("bill") || lower.includes("spent") || lower.includes("paid")) {
      const amount = extractAmount(text);
      const category = expenseCategories.find((item) => lower.includes(item.toLowerCase())) || "Other";
      const name = category === "Other" ? text.replace(/record|expense|bill|spent|paid|ngn|₦/gi, "").replace(/\d|,/g, "").trim() || "Business expense" : category;
      if (!amount) return "Tell me the amount for the expense. Example: Record NGN 15000 electricity bill.";
      const draftExpense: AiDraft = { type: "expense", name, category, amount, paymentMethod: "Cash", notes: `Created from OgaBiz AI: ${text}` };
      setDraft(draftExpense);
      return `I found this expense:\n${name}\nCategory: ${category}\nAmount: ${money(amount)}\n\nPlease confirm before I save it.`;
    }
    return "";
  };
  const ask = (text: string) => {
    const t = totals(state);
    const lower = text.toLowerCase();
    const lowStock = state.products.filter((product) => stockStatus(product) !== "In Stock");
    const owing = state.debts.filter((debt) => debt.amountOwed > debt.amountPaid);
    const best = [...state.sales].sort((a, b) => b.quantity - a.quantity)[0];
    setDraft(null);
    const actionResponse = prepareAction(text);
    const response = actionResponse || (lower.includes("low") || lower.includes("stock")
      ? lowStock.length ? lowStock.map((product) => `${product.name}: ${product.quantity} ${product.unit} left`).join("\n") : "No product is currently low in stock."
      : lower.includes("owe") || lower.includes("debt")
        ? owing.length ? owing.map((debt) => `${debt.customerName} owes ${money(debt.amountOwed - debt.amountPaid)}.`).join("\n") : "No customer has an outstanding balance."
        : lower.includes("spend") || lower.includes("expense")
          ? `You have recorded ${money(t.expenses)} in expenses.`
          : lower.includes("sell") || lower.includes("best")
            ? best ? `${best.productName} is currently the best-selling product by quantity.` : "There is not enough sales data yet."
            : lower.includes("profit") || lower.includes("make")
              ? `Estimated net profit is ${money(t.netProfit)} from ${money(t.revenue)} in sales.`
              : `Sales are ${money(t.revenue)}, expenses are ${money(t.expenses)}, and outstanding debt is ${money(t.debt)}.`);
    setAnswer(response);
    setQuestion(text);
  };
  const confirmDraft = async () => {
    if (!draft) return;
    try {
      if (draft.type === "sale") {
        const sale: Sale = { id: newId("sale"), productId: draft.product.id, productName: draft.product.name, quantity: draft.quantity, sellingPrice: draft.product.sellingPrice, costPrice: draft.product.costPrice, customerId: draft.customer?.id, customerName: draft.customer?.name, paymentMethod: draft.paymentMethod, paymentStatus: draft.paymentStatus, amountPaid: draft.amountPaid, date: new Date().toISOString().slice(0, 10), notes: draft.notes };
        const data = await saveRecord("/api/sales", { productId: draft.product.id, customerId: draft.customer?.id, quantity: draft.quantity, sellingPrice: draft.product.sellingPrice, amountPaid: draft.amountPaid, paymentMethod: draft.paymentMethod, paymentStatus: draft.paymentStatus, date: sale.date, notes: sale.notes });
        const savedSale = data.sale?._id ? { ...sale, id: String(data.sale._id) } : sale;
        setState((s) => ({ ...s, sales: [savedSale, ...s.sales], products: s.products.map((product) => product.id === draft.product.id ? { ...product, quantity: product.quantity - draft.quantity } : product), activityLog: [`OgaBiz AI recorded a ${money(saleRevenue(sale))} sale for ${draft.product.name}.`, ...s.activityLog] }));
        setAnswer(`Saved. I recorded ${draft.quantity} x ${draft.product.name}, reduced inventory, and updated your dashboard.`);
        setNotice("OgaBiz AI saved the sale to MongoDB.");
      } else {
        const expense: Expense = { id: newId("exp"), name: draft.name, category: draft.category, amount: draft.amount, date: new Date().toISOString().slice(0, 10), paymentMethod: draft.paymentMethod, notes: draft.notes };
        const data = await saveRecord("/api/expenses", expense);
        const savedExpense = data.expense?._id ? { ...expense, id: String(data.expense._id) } : expense;
        setState((s) => ({ ...s, expenses: [savedExpense, ...s.expenses], activityLog: [`OgaBiz AI recorded ${money(expense.amount)} ${expense.category.toLowerCase()} expense.`, ...s.activityLog] }));
        setAnswer(`Saved. I recorded ${draft.name} as a ${money(draft.amount)} expense and updated your reports.`);
        setNotice("OgaBiz AI saved the expense to MongoDB.");
      }
      setDraft(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "OgaBiz AI could not save that record.");
    }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (question.trim()) ask(question);
  };
  return <Page title="OgaBiz Assistant" subtitle="Ask questions about your business or prepare safe actions for sales and expenses."><Card className="min-h-[560px] rounded-lg"><CardContent className="flex min-h-[560px] flex-col justify-between gap-6 pt-6"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{["How much did I make today?", "Show me products that are low in stock.", "Who owes me money?", "Record NGN 15000 electricity bill", state.products[0] ? `I sold 1 ${state.products[0].name}` : "I sold 3 Coca-Cola"].map((q) => <button key={q} onClick={() => ask(q)} className="rounded-md border bg-white p-4 text-left text-sm hover:bg-secondary">{q}</button>)}</div><div className="whitespace-pre-line rounded-md bg-secondary p-4 text-sm">{answer}</div>{draft && <div className="rounded-lg border border-primary/25 bg-white p-4"><p className="font-semibold">Ready to save this {draft.type}?</p><p className="mt-2 text-sm text-muted-foreground">I will only save it after you confirm.</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={confirmDraft} disabled={!backendReady}>Confirm and Save</Button><Button variant="outline" onClick={() => { setDraft(null); setAnswer("Cancelled. I did not save anything."); }}>Cancel</Button></div></div>}<form className="flex gap-2" onSubmit={submit}><Input placeholder="Ask OgaBiz anything about your business..." value={question} onChange={(event) => setQuestion(event.target.value)} /><Button size="icon" variant="outline" type="button" aria-label="Voice input"><Mic /></Button><Button type="submit">Send</Button></form></CardContent></Card></Page>;
}

function Notifications({ state, go }: { state: AppState; go: (view: View) => void }) {
  const lowStock = state.products.filter((product) => product.quantity > 0 && product.quantity <= product.lowStockThreshold);
  const outOfStock = state.products.filter((product) => product.quantity <= 0);
  const owing = state.debts.filter((debt) => debt.amountOwed > debt.amountPaid);
  const notifications = [
    ...outOfStock.map((product) => ({ title: "Out of stock", message: `${product.name} is out of stock.`, target: "inventory" as View })),
    ...lowStock.map((product) => ({ title: "Low stock", message: `${product.name} has only ${product.quantity} ${product.unit} remaining.`, target: "inventory" as View })),
    ...owing.map((debt) => ({ title: "Customer debt", message: `${debt.customerName} still owes ${money(debt.amountOwed - debt.amountPaid)}.`, target: "debts" as View })),
    ...state.activityLog.slice(0, 4).map((activity) => ({ title: "Business activity", message: activity, target: "dashboard" as View })),
  ];

  return (
    <Page title="Notifications" subtitle="Important stock, debt, and business updates from your real records.">
      <div className="grid gap-4">
        {notifications.map((item, index) => (
          <Card key={`${item.title}-${item.message}`} className="dashboard-card rounded-lg" style={{ animationDelay: `${index * 70}ms` }}>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">{item.title}</p>
                <p className="mt-1 text-muted-foreground">{item.message}</p>
              </div>
              <Button variant="outline" onClick={() => go(item.target)}>Open</Button>
            </CardContent>
          </Card>
        ))}
        {!notifications.length && <Empty text="No notifications yet. Stock, debt, and activity alerts will appear here when your business records need attention." button="Go to Dashboard" onAction={() => go("dashboard")} />}
      </div>
    </Page>
  );
}

function SettingsPage({ state, setState, setNotice, backendReady }: SectionProps) {
  return <Page title="Settings" subtitle="Business profile, account, currency, notifications, security and placeholders for staff and subscription."><Card className="rounded-lg"><CardContent className="grid gap-4 pt-6 md:grid-cols-2"><Field label="Business name" defaultValue={state.business.name} onChange={(value) => setState((s) => ({ ...s, business: { ...s.business, name: value } }))} /><Field label="Phone" defaultValue={state.business.phone} onChange={(value) => setState((s) => ({ ...s, business: { ...s.business, phone: value } }))} /><Field label="Email" defaultValue={state.business.email} onChange={(value) => setState((s) => ({ ...s, business: { ...s.business, email: value } }))} /><SelectField label="Business type" options={businessTypes} defaultValue={state.business.type} onChange={(value) => setState((s) => ({ ...s, business: { ...s.business, type: value } }))} /><Field label="Address" defaultValue={state.business.location} onChange={(value) => setState((s) => ({ ...s, business: { ...s.business, location: value } }))} /><Field label="Logo" onChange={(value) => setState((s) => ({ ...s, business: { ...s.business, logo: value } }))} /><Button className="md:col-span-2" onClick={async () => { if (backendReady) await saveRecord("/api/business", state.business, "PATCH"); setNotice("Business settings saved."); }}>Save settings</Button></CardContent></Card><div className="grid gap-4 md:grid-cols-3">{["Currency", "Notifications", "Security", "Users/Staff", "Subscription"].map((section) => <Card key={section} className="rounded-lg"><CardHeader><CardTitle>{section}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Ready for your next setup step.</CardContent></Card>)}</div></Page>;
}

type SectionProps = { state: AppState; setState: Dispatch<SetStateAction<AppState>>; setNotice: (notice: string) => void; backendReady?: boolean };

async function saveRecord(url: string, body: unknown, method = "POST") {
  let businessId = window.localStorage.getItem("ogabiz_business_id");
  if (!businessId) {
    const savedState = window.localStorage.getItem(storageKey);
    const savedBusinessId = savedState ? JSON.parse(savedState).business?.id : "";
    if (savedBusinessId) {
      businessId = savedBusinessId;
      window.localStorage.setItem("ogabiz_business_id", savedBusinessId);
    }
  }

  const payload =
    body && typeof body === "object" && !Array.isArray(body) && businessId
      ? { businessId, ...body }
      : body;

  const response = await fetch(`${apiBaseUrl}${url}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    let message = "Save failed. Make sure the backend is running.";
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // Keep the default message when the server does not return JSON.
    }
    throw new Error(message);
  }
  return response.json();
}

function Page({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <div className="mx-auto flex max-w-7xl flex-col gap-5"><div><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-1 text-muted-foreground">{subtitle}</p></div>{children}</div>;
}

function Field({ label, type = "text", defaultValue = "", textarea, onChange }: { label: string; type?: string; defaultValue?: string; textarea?: boolean; onChange?: (value: string) => void }) {
  return <div className="space-y-2"><Label>{label}</Label>{textarea ? <Textarea name={label} defaultValue={defaultValue} onChange={(e) => onChange?.(e.target.value)} /> : <Input name={label} type={type} defaultValue={defaultValue} onChange={(e) => onChange?.(e.target.value)} />}</div>;
}

function SelectField({ label, options, defaultValue, onChange }: { label: string; options: string[]; defaultValue?: string; onChange?: (value: string) => void }) {
  return <div className="space-y-2"><Label>{label}</Label><select name={label} defaultValue={defaultValue} onChange={(event) => onChange?.(event.target.value)} className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm">{options.map((o) => <option key={o}>{o}</option>)}</select></div>;
}

function DataForm({ title, fields, defaults = {}, options = {}, onSubmit }: { title: string; fields: string[]; defaults?: Record<string, string>; options?: Record<string, string[]>; onSubmit: (values: Record<string, string>) => void | boolean | Promise<void | boolean> }) {
  const [saving, setSaving] = useState(false);
  return <Card className="rounded-lg"><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><form className="grid gap-4 md:grid-cols-3" onSubmit={async (event) => { event.preventDefault(); setSaving(true); const form = event.currentTarget; const data = new FormData(form); const values = Object.fromEntries(fields.map((field) => [field, String(data.get(field) || defaults[field] || "")])); try { const result = await onSubmit(values); if (result !== false) form.reset(); } finally { setSaving(false); } }}>{fields.map((field) => field === "Notes" || field === "Description" ? <div key={field} className="md:col-span-3"><Field label={field} defaultValue={defaults[field]} textarea /></div> : options[field]?.length ? <SelectField key={field} label={field} defaultValue={defaults[field]} options={options[field]} /> : field === "Unit" ? <SelectField key={field} label={field} defaultValue={defaults[field]} options={units} /> : <Field key={field} label={field} defaultValue={defaults[field]} type={field.includes("Date") || field.includes("date") ? "date" : field.includes("price") || field.includes("Amount") || field.includes("Quantity") || field.includes("threshold") ? "number" : "text"} />)}<Button type="submit" className="md:col-span-3" disabled={saving}>{saving ? "Saving..." : title}</Button></form></CardContent></Card>;
}

function Metric({ label, value, detail, icon, index = 0, onClick, actionLabel }: { label: string; value: string; detail?: string; icon?: ReactNode; index?: number; onClick?: () => void; actionLabel?: string }) {
  const interactiveProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
        onClick,
        onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <Card
      className={`dashboard-card rounded-lg ${onClick ? "group outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-primary" : ""}`}
      style={{ animationDelay: `${index * 70}ms` }}
      aria-label={actionLabel}
      {...interactiveProps}
    >
      <CardContent className="flex min-h-32 items-center justify-between gap-4 pt-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{value}</p>
          {detail && <p className="mt-2 text-sm text-muted-foreground">{detail}</p>}
          {onClick && <p className="mt-3 text-sm font-semibold text-primary opacity-80 transition group-hover:opacity-100">Open</p>}
        </div>
        {icon && <div className="rounded-md bg-secondary p-3 text-primary shadow-inner transition group-hover:bg-primary group-hover:text-white">{icon}</div>}
      </CardContent>
    </Card>
  );
}

function MiniChart({ sales = [] }: { sales?: Sale[] }) {
  const values = sales.slice(0, 10).reverse().map((sale) => saleRevenue(sale));
  if (!values.length) {
    return <div className="flex h-72 items-center justify-center rounded-md border border-dashed bg-white p-4 text-center text-sm text-muted-foreground">No sales yet. Record a sale to see your sales trend.</div>;
  }
  const max = Math.max(...values, 1);
  return <div className="h-72 rounded-md border bg-white p-4"><div className="flex h-full items-end gap-2 sm:gap-3">{values.map((value, index) => { const height = Math.max(12, Math.round((value / max) * 100)); return <span key={`${value}-${index}`} className="dashboard-bar flex-1 rounded-t bg-primary/85" style={{ height: `${height}%`, animationDelay: `${index * 80}ms` }} title={money(value)} />; })}</div></div>;
}

function FocusRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 rounded-md bg-secondary p-3"><span className="text-muted-foreground">{label}</span><span className="text-right font-semibold">{value}</span></div>;
}

function List({ title, items, empty, action, onAction }: { title: string; items: string[]; empty: string; action: string; onAction?: () => void }) {
  return <Card className="dashboard-card rounded-lg"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent>{items.length ? <ul className="space-y-3 text-sm">{items.slice(0, 5).map((item, index) => <li key={item} className="dashboard-list-item rounded-md bg-secondary p-3" style={{ animationDelay: `${index * 70}ms` }}>{item}</li>)}</ul> : <Empty text={empty} button={action} onAction={onAction} />}</CardContent></Card>;
}

function Empty({ text, button, onAction }: { text: string; button: string; onAction?: () => void }) {
  return <div className="rounded-md border border-dashed p-6 text-center"><p className="text-muted-foreground">{text}</p><Button className="dashboard-header-button mt-4" variant="outline" onClick={onAction}>{button}</Button></div>;
}

function Filters({ search, setSearch, category, setCategory, categories }: { search: string; setSearch: (v: string) => void; category: string; setCategory: (v: string) => void; categories: string[] }) {
  return <div className="grid gap-3 md:grid-cols-[1fr_240px]"><div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} /></div><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 rounded-md border border-input bg-white px-3 text-sm"><option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>;
}
