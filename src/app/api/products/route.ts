import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { z } from "zod";

const createProductBodySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  type: z.enum(["Image Bundle", "Document", "Template", "Video", "Audio"]),
  price: z.number().min(0),
  status: z.enum(["Active", "Draft", "Archived"]).default("Draft"),
  thumbnail_url: z.string().url().optional().nullable(),
  download_url: z.string().url().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

/**
 * GET /api/products
 * Returns the authenticated user's products.
 * Supports: ?status=Active|Draft|Archived, ?limit=20, ?offset=0
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && ["Active", "Draft", "Archived"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 500 });
    }

    return NextResponse.json(
      successResponse(data, { total: count ?? 0, limit, offset })
    );
  } catch {
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}

/**
 * POST /api/products
 * Creates a new product for the authenticated user.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(errorResponse("Unauthorized"), { status: 401 });
    }

    const body = await request.json();
    const parsed = createProductBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("Validation failed", parsed.error.issues),
        { status: 422 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert({ user_id: user.id, ...parsed.data })
      .select()
      .single();

    if (error) {
      return NextResponse.json(errorResponse(error.message), { status: 500 });
    }

    return NextResponse.json(successResponse(data), { status: 201 });
  } catch {
    return NextResponse.json(errorResponse("Internal server error"), { status: 500 });
  }
}
