import { Cart } from "../models/cart.model";
import { DiscountCode, DiscountConfig } from "../models/discount.model";
import { Order } from "../models/order.model";

const defaultConfig: DiscountConfig = {
  nthOrder: 3,
  discountPercent: 10,
};

class MemoryStore {
  carts = new Map<string, Cart>();
  orders: Order[] = [];
  discountCodes = new Map<string, DiscountCode>();
  config: DiscountConfig = { ...defaultConfig };

  reset(): void {
    this.carts.clear();
    this.orders = [];
    this.discountCodes.clear();
    this.config = { ...defaultConfig };
  }
}

export const memoryStore = new MemoryStore();
