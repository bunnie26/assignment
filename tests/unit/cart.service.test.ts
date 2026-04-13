import { CartService } from "../../src/services/cart.service";
import { memoryStore } from "../../src/store/memory.store";

describe("CartService", () => {
  const service = new CartService();

  beforeEach(() => {
    memoryStore.reset();
  });

  it("creates a cart on first add", () => {
    const cart = service.addItem("user_1", {
      itemId: "sku_1",
      name: "Mouse",
      unitPrice: 20,
      quantity: 1,
    });

    expect(cart.userId).toBe("user_1");
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].itemId).toBe("sku_1");
  });

  it("increments quantity for existing item", () => {
    service.addItem("user_1", {
      itemId: "sku_1",
      name: "Mouse",
      unitPrice: 20,
      quantity: 1,
    });

    const cart = service.addItem("user_1", {
      itemId: "sku_1",
      name: "Mouse",
      unitPrice: 20,
      quantity: 2,
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
  });
});
