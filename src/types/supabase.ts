// ─── Supabase Database Types ─────────────────────────────────────────────────
// Auto-generate the production version with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
//
// Until then, this hand-written type file mirrors the 0002_expanded_schema.sql migration.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Enums ────────────────────────────────────────────────────────────────────

export type ProductType =
  | "Image Bundle"
  | "Document"
  | "Template"
  | "Video"
  | "Audio";

export type ProductStatus = "Active" | "Draft" | "Archived";

export type OrderStatus = "Completed" | "Pending" | "Refunded" | "Failed";

export type PaymentProvider = "stripe" | "paypal" | "manual";

export type GenerationType = "Image" | "Caption" | "Text";

export type GenerationStatus = "Ready" | "Processing" | "Failed";

// ── Export Enums (added in 0004_export_system.sql) ───────────────────────────

export type DbExportStatus = "idle" | "pending" | "done" | "failed";

export type DbExportType = "pdf" | "zip";

// ── Database ─────────────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      // ── profiles ────────────────────────────────────────────────────────────
      // Extends auth.users — created via trigger on signup.
      profiles: {
        Row: {
          id: string;             // references auth.users.id
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          store_name: string | null;
          custom_domain: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          store_name?: string | null;
          custom_domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          store_name?: string | null;
          custom_domain?: string | null;
          updated_at?: string;
        };
      };

      // ── products ─────────────────────────────────────────────────────────────
      products: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          type: ProductType;
          price: number;
          status: ProductStatus;
          thumbnail_url: string | null;     // cover image for listings
          download_url: string | null;      // secure download link
          tags: string[];                   // array of tag strings
          // ── AI columns (0003) ────────────────────────────────────────────
          ai_generated: boolean;
          ai_generation_id: string | null;
          sections: Json | null;
          cta: string | null;
          instagram_caption: string | null;
          hashtags: string[] | null;
          // ── Export columns (0004) ────────────────────────────────────────
          export_status: DbExportStatus;
          pdf_url: string | null;
          zip_url: string | null;
          version: string;
          export_metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          type?: ProductType;
          price?: number;
          status?: ProductStatus;
          thumbnail_url?: string | null;
          download_url?: string | null;
          tags?: string[];
          ai_generated?: boolean;
          ai_generation_id?: string | null;
          sections?: Json | null;
          cta?: string | null;
          instagram_caption?: string | null;
          hashtags?: string[] | null;
          export_status?: DbExportStatus;
          pdf_url?: string | null;
          zip_url?: string | null;
          version?: string;
          export_metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          type?: ProductType;
          price?: number;
          status?: ProductStatus;
          thumbnail_url?: string | null;
          download_url?: string | null;
          tags?: string[];
          ai_generated?: boolean;
          ai_generation_id?: string | null;
          sections?: Json | null;
          cta?: string | null;
          instagram_caption?: string | null;
          hashtags?: string[] | null;
          export_status?: DbExportStatus;
          pdf_url?: string | null;
          zip_url?: string | null;
          version?: string;
          export_metadata?: Json | null;
          updated_at?: string;
        };
      };

      // ── orders ───────────────────────────────────────────────────────────────
      orders: {
        Row: {
          id: string;
          user_id: string;              // seller
          product_id: string;
          customer_email: string;
          amount: number;
          order_status: OrderStatus;
          payment_status: "paid" | "pending" | "refunded" | "failed";
          payment_provider: PaymentProvider | null;
          payment_reference: string | null; // Stripe charge ID, PayPal tx, etc.
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          customer_email: string;
          amount: number;
          order_status?: OrderStatus;
          payment_status?: "paid" | "pending" | "refunded" | "failed";
          payment_provider?: PaymentProvider | null;
          payment_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          customer_email?: string;
          amount?: number;
          order_status?: OrderStatus;
          payment_status?: "paid" | "pending" | "refunded" | "failed";
          payment_provider?: PaymentProvider | null;
          payment_reference?: string | null;
          updated_at?: string;
        };
      };

      // ── ai_generations ───────────────────────────────────────────────────────
      ai_generations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          prompt: string;
          output: string | null;        // URL or text output from AI
          generation_type: GenerationType;
          status: GenerationStatus;
          model_used: string | null;    // e.g. "dall-e-3", "gpt-4o"
          metadata: Json | null;        // flexible field for extra AI output data
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          prompt: string;
          output?: string | null;
          generation_type?: GenerationType;
          status?: GenerationStatus;
          model_used?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          prompt?: string;
          output?: string | null;
          generation_type?: GenerationType;
          status?: GenerationStatus;
          model_used?: string | null;
          metadata?: Json | null;
          updated_at?: string;
        };
      };

      // ── export_logs ──────────────────────────────────────────────────────────
      export_logs: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          export_type: DbExportType;
          status: DbExportStatus;
          storage_path: string | null;
          public_url: string | null;
          file_size_bytes: number | null;
          version: string;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          export_type: DbExportType;
          status?: DbExportStatus;
          storage_path?: string | null;
          public_url?: string | null;
          file_size_bytes?: number | null;
          version?: string;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: DbExportStatus;
          storage_path?: string | null;
          public_url?: string | null;
          file_size_bytes?: number | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      product_type: ProductType;
      product_status: ProductStatus;
      order_status: OrderStatus;
      payment_provider: PaymentProvider;
      generation_type: GenerationType;
      generation_status: GenerationStatus;
      export_status: DbExportStatus;
      export_type: DbExportType;
    };
  };
};

// ── Convenience row types ─────────────────────────────────────────────────────

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type AiGeneration = Database["public"]["Tables"]["ai_generations"]["Row"];
export type ExportLog = Database["public"]["Tables"]["export_logs"]["Row"];

export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type AiGenerationInsert = Database["public"]["Tables"]["ai_generations"]["Insert"];
export type ExportLogInsert = Database["public"]["Tables"]["export_logs"]["Insert"];
