import { CartService } from "../../src/services/cart.service";
import { CheckoutService } from "../../src/services/checkout.service";
import { DiscountService } from "../../src/services/discount.service";
import { memoryStore } from "../../src/store/memory.store";
import { AppError } from "../../src/utils/errors";

describe("CheckoutService", () => {
  const cartService = new CartService();
  const discountService = new DiscountService();
  const service = new CheckoutService(cartService, discountService);

  beforeEach(() => {
    memoryStore.reset();
  });

  it("checks out without coupon", () => {
    cartService.addItem("user_1", {
      itemId: "sku_1",
      name: "Keyboard",
      unitPrice: 50,
      quantity: 1,
    });

    const result = service.checkout({ userId: "user_1" });
    expect(result.order.total).toBe(50);
    expect(memoryStore.orders).toHaveLength(1);
    expect(cartService.getCart("user_1")?.items).toHaveLength(0);
  });

  it("checks out with valid coupon and marks it used", () => {
    cartService.addItem("user_1", {
      itemId: "sku_1",
      name: "Keyboard",
      unitPrice: 100,
      quantity: 1,
    });

    memoryStore.discountCodes.set("SAVE10-AAAA", {
      code: "SAVE10-AAAA",
      percent: 10,
      generatedForOrderNumber: 3,
      isUsed: false,
    });

    const result = service.checkout({ userId: "user_1", discountCode: "SAVE10-AAAA" });
    expect(result.order.discountAmount).toBe(10);
    expect(memoryStore.discountCodes.get("SAVE10-AAAA")?.isUsed).toBe(true);
  });

  it("rejects empty cart", () => {
    expect(() => service.checkout({ userId: "user_1" })).toThrow(AppError);
  });

  it("rejects reused coupon", () => {
    cartService.addItem("user_1", {
      itemId: "sku_1",
      name: "Keyboard",
      unitPrice: 100,
      quantity: 1,
    });

    memoryStore.discountCodes.set("SAVE10-AAAA", {
      code: "SAVE10-AAAA",
      percent: 10,
      generatedForOrderNumber: 3,
      isUsed: true,
    });

    expect(() => service.checkout({ userId: "user_1", discountCode: "SAVE10-AAAA" })).toThrow(
      "Coupon code already used",
    );
  });
});
