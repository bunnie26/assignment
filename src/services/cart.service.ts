import { Cart, CartItem } from "../models/cart.model";
import { memoryStore } from "../store/memory.store";

export class CartService {
  addItem(userId: string, item: CartItem): Cart {
    const existingCart = memoryStore.carts.get(userId);
    const cart: Cart = existingCart ?? {
      userId,
      items: [],
      updatedAt: new Date().toISOString(),
    };

    const existingItem = cart.items.find((cartItem) => cartItem.itemId === item.itemId);
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.items.push({ ...item });
    }

    cart.updatedAt = new Date().toISOString();
    memoryStore.carts.set(userId, cart);
    return cart;
  }

  getCart(userId: string): Cart | undefined {
    return memoryStore.carts.get(userId);
  }

  clearCart(userId: string): Cart {
    const clearedCart: Cart = {
      userId,
      items: [],
      updatedAt: new Date().toISOString(),
    };
    memoryStore.carts.set(userId, clearedCart);
    return clearedCart;
  }
}
