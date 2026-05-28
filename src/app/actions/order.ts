"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── Validation Schemas ───────────────────────────────────────────────────────

const createOrderSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  customer_email: z.string().email("Invalid customer email"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  order_status: z
    .enum(["Completed", "Pending", "Refunded", "Failed"])
    .default("Pending"),
  payment_status: z
    .enum(["paid", "pending", "refunded", "failed"])
    .default("pending"),
  payment_provider: z
    .enum(["stripe", "paypal", "manual"])
    .optional(),
  payment_reference: z.string().optional(),
});

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create an order." };
  }

  const parsed = createOrderSchema.safeParse({
    product_id: formData.get("product_id"),
    customer_email: formData.get("customer_email"),
    amount: formData.get("amount"),
    order_status: formData.get("order_status"),
    payment_status: formData.get("payment_status"),
    payment_provider: formData.get("payment_provider"),
    payment_reference: formData.get("payment_reference"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError?.message ?? "Invalid order data." };
  }

  const { error } = await supabase.from("orders").insert({
    user_id: user.id,
    product_id: parsed.data.product_id,
    customer_email: parsed.data.customer_email,
    amount: parsed.data.amount,
    order_status: parsed.data.order_status,
    payment_status: parsed.data.payment_status,
    payment_provider: parsed.data.payment_provider ?? null,
    payment_reference: parsed.data.payment_reference ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");

  return { success: true };
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: "Completed" | "Pending" | "Refunded" | "Failed",
  paymentStatus?: "paid" | "pending" | "refunded" | "failed"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to update an order." };
  }

  const updateData: Record<string, string> = { order_status: orderStatus };
  if (paymentStatus) updateData.payment_status = paymentStatus;

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");

  return { success: true };
}
