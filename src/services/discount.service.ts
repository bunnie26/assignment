import { DiscountCode, DiscountConfig } from "../models/discount.model";
import { memoryStore } from "../store/memory.store";
import { buildCouponCode } from "../utils/coupon.util";
import { AppError } from "../utils/errors";

export class DiscountService {
  setConfig(config: DiscountConfig): DiscountConfig {
    memoryStore.config = { ...config };
    return memoryStore.config;
  }

  getConfig(): DiscountConfig {
    return memoryStore.config;
  }

  getValidDiscountCode(code: string): DiscountCode {
    const discount = memoryStore.discountCodes.get(code);

    if (!discount) {
      throw new AppError("Invalid coupon code", 400);
    }

    if (discount.isUsed) {
      throw new AppError("Coupon code already used", 400);
    }

    return discount;
  }

  markAsUsed(code: string): void {
    const discount = memoryStore.discountCodes.get(code);
    if (!discount) {
      return;
    }

    discount.isUsed = true;
    discount.usedAt = new Date().toISOString();
    memoryStore.discountCodes.set(code, discount);
  }

  generateCouponIfEligible(orderCount: number): DiscountCode | null {
    const { nthOrder, discountPercent } = memoryStore.config;
    if (orderCount <= 0 || orderCount % nthOrder !== 0) {
      return null;
    }

    let attempts = 0;
    while (attempts < 5) {
      const code = buildCouponCode(discountPercent);
      if (!memoryStore.discountCodes.has(code)) {
        const coupon: DiscountCode = {
          code,
          percent: discountPercent,
          generatedForOrderNumber: orderCount,
          isUsed: false,
        };
        memoryStore.discountCodes.set(code, coupon);
        return coupon;
      }
      attempts += 1;
    }

    throw new AppError("Could not generate unique coupon code", 500);
  }
}
