import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(80),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Product Schemas ──────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(1000).optional(),
  type: z.enum(["Image Bundle", "Document", "Template", "Video", "Audio"]),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  status: z.enum(["Active", "Draft", "Archived"]).default("Draft"),
  thumbnail_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  download_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  tags: z.string().optional(), // comma-separated string
});

// ─── Order Schemas ────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  customer_email: z.string().email("Invalid customer email"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  payment_provider: z.enum(["stripe", "paypal", "manual"]).optional(),
});

// ─── Generation Schemas ───────────────────────────────────────────────────────

export const createGenerationSchema = z.object({
  prompt: z
    .string()
    .min(3, "Prompt must be at least 3 characters")
    .max(2000, "Prompt is too long"),
  generation_type: z.enum(["Image", "Caption", "Text"]).default("Image"),
});

// ─── Settings Schemas ─────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(80),
  store_name: z.string().max(100).optional(),
  custom_domain: z
    .string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-_.]+$/, "Invalid domain format")
    .optional()
    .or(z.literal("")),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
