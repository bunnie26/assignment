export interface CartItem {
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}
