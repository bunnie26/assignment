import { CartService } from "../../src/services/cart.service";
import { CheckoutService } from "../../src/services/checkout.service";
import { DiscountService } from "../../src/services/discount.service";
import { StatsService } from "../../src/services/stats.service";
import { memoryStore } from "../../src/store/memory.store";

describe("StatsService", () => {
  const cartService = new CartService();
  const discountService = new DiscountService();
  const checkoutService = new CheckoutService(cartService, discountService);
  const statsService = new StatsService();

  beforeEach(() => {
    memoryStore.reset();
  });

  it("returns accurate totals", () => {
    cartService.addItem("user_1", {
      itemId: "sku_1",
      name: "Mouse",
      unitPrice: 25,
      quantity: 2,
    });

    memoryStore.discountCodes.set("SAVE10-AAAA", {
      code: "SAVE10-AAAA",
      percent: 10,
      generatedForOrderNumber: 3,
      isUsed: false,
    });

    checkoutService.checkout({ userId: "user_1", discountCode: "SAVE10-AAAA" });

    const stats = statsService.getStats();
    expect(stats.totalOrders).toBe(1);
    expect(stats.totalItemsPurchased).toBe(2);
    expect(stats.totalRevenue).toBe(45);
    expect(stats.totalDiscountAmountGiven).toBe(5);
    expect(stats.discountCodes.totalUsed).toBe(1);
  });
});
