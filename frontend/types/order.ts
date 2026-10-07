export interface OrderProduct {
  product: string | { _id: string; name: string; price: number };
  quantity: number;
}

export interface Order {
  _id: string;
  user: { _id: string; name: string; email: string } | string;
  products: OrderProduct[];
  totalAmount: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
