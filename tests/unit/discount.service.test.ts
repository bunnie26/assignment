import { DiscountService } from "../../src/services/discount.service";
import { memoryStore } from "../../src/store/memory.store";
import * as couponUtil from "../../src/utils/coupon.util";

describe("DiscountService", () => {
  const service = new DiscountService();

  beforeEach(() => {
    memoryStore.reset();
  });

  it("updates discount config", () => {
    const config = service.setConfig({ nthOrder: 5, discountPercent: 15 });
    expect(config).toEqual({ nthOrder: 5, discountPercent: 15 });
  });

  it("generates coupon only on nth order", () => {
    expect(service.generateCouponIfEligible(1)).toBeNull();

    const coupon = service.generateCouponIfEligible(3);
    expect(coupon).not.toBeNull();
    expect(coupon?.percent).toBe(10);
  });

  it("retries when coupon code collides", () => {
    const spy = jest
      .spyOn(couponUtil, "buildCouponCode")
      .mockReturnValueOnce("SAVE10-ABCD")
      .mockReturnValueOnce("SAVE10-ABCD")
      .mockReturnValueOnce("SAVE10-WXYZ");

    memoryStore.discountCodes.set("SAVE10-ABCD", {
      code: "SAVE10-ABCD",
      percent: 10,
      generatedForOrderNumber: 3,
      isUsed: false,
    });

    const coupon = service.generateCouponIfEligible(6);
    expect(coupon?.code).toBe("SAVE10-WXYZ");
    spy.mockRestore();
  });
});
