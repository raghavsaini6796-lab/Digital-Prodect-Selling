/**
 * Application-wide constants.
 * Import from this file — never hardcode strings in components.
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "D Product Selling";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  products: "/dashboard/products",
  orders: "/dashboard/orders",
  aiGenerator: "/dashboard/ai-generator",
  instagram: "/dashboard/instagram",
  settings: "/dashboard/settings",
} as const;

export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    callback: "/api/auth/callback",
  },
  products: "/api/products",
  instagram: "/api/instagram",
} as const;

export const QUERY_KEYS = {
  user: ["user"] as const,
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,
  instagramAccounts: ["instagram-accounts"] as const,
} as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 20,
} as const;
