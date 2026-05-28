"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrder } from "@/app/actions/order";

interface ProductOption {
  id: string;
  title: string;
  price: number;
}

interface CreateOrderModalProps {
  products: ProductOption[];
}

export function CreateOrderModal({ products }: CreateOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to first product's price if available
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [amount, setAmount] = useState<number>(products[0]?.price || 0);

  const handleProductChange = (value: string | null) => {
    if (!value) return;
    setSelectedProductId(value);
    const product = products.find(p => p.id === value);
    if (product) {
      setAmount(product.price);
    }
  };
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (products.length === 0) {
      setError("You need to create a product first.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("product_id", selectedProductId);
    
    const result = await createOrder(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Order</DialogTitle>
            <DialogDescription>
              Manually log a new order for a product.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</div>}
            
            {products.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
                No products found. Create a product first before recording orders.
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Select 
                    value={selectedProductId} 
                    onValueChange={handleProductChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="customer_email">Customer Email</Label>
                  <Input 
                    id="customer_email" 
                    name="customer_email" 
                    type="email" 
                    placeholder="customer@example.com" 
                    required 
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required 
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || products.length === 0}>
              {loading ? "Saving..." : "Save Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
