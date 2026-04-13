import { CartItem } from "./cart.model";

export interface AddToCartInput {
  userId: string;
  item: CartItem;
}

export interface CheckoutInput {
  userId: string;
  discountCode?: string;
}
