export interface OrderItemSnapshot {
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discountCode?: string;
  discountPercent?: number;
  discountAmount: number;
  total: number;
  createdAt: string;
}
