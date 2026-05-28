export type ProductStatus = "draft" | "published" | "archived";

export interface Product {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  thumbnail_url: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  price: number;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  status?: ProductStatus;
}
