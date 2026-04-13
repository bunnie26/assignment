import { CheckoutInput } from "../models/common.types";
import { Order, OrderItemSnapshot } from "../models/order.model";
import { memoryStore } from "../store/memory.store";
import { AppError } from "../utils/errors";
import { buildOrderId } from "../utils/id.util";
import { roundMoney } from "../utils/money.util";
import { CartService } from "./cart.service";
import { DiscountService } from "./discount.service";

export interface CheckoutResult {
  order: Order;
  generatedCoupon: {
    eligible: boolean;
    code?: string;
    percent?: number;
  };
}

export class CheckoutService {
  constructor(
    private readonly cartService: CartService,
    private readonly discountService: DiscountService,
  ) {}

  checkout(input: CheckoutInput): CheckoutResult {
    const cart = this.cartService.getCart(input.userId);
    if (!cart) {
      throw new AppError("Cart for given user not found", 404);
    }

    if (cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    const orderItems: OrderItemSnapshot[] = cart.items.map((item) => {
      const lineTotal = roundMoney(item.unitPrice * item.quantity);
      return {
        itemId: item.itemId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const subtotal = roundMoney(orderItems.reduce((sum, item) => sum + item.lineTotal, 0));

    let discountAmount = 0;
    let discountPercent: number | undefined;
    let appliedCode: string | undefined;

    if (input.discountCode) {
      const discount = this.discountService.getValidDiscountCode(input.discountCode);
      discountPercent = discount.percent;
      discountAmount = roundMoney(subtotal * (discountPercent / 100));
      appliedCode = discount.code;
    }

    const total = roundMoney(Math.max(subtotal - discountAmount, 0));
    const nextOrderCount = memoryStore.orders.length + 1;
    const order: Order = {
      orderId: buildOrderId(nextOrderCount),
      userId: input.userId,
      items: orderItems,
      subtotal,
      discountCode: appliedCode,
      discountPercent,
      discountAmount,
      total,
      createdAt: new Date().toISOString(),
    };

    memoryStore.orders.push(order);

    if (input.discountCode) {
      // Re-check right before marking used to keep checkout mutation safe.
      this.discountService.getValidDiscountCode(input.discountCode);
      this.discountService.markAsUsed(input.discountCode);
    }

    this.cartService.clearCart(input.userId);

    const generatedCoupon = this.discountService.generateCouponIfEligible(memoryStore.orders.length);
    return {
      order,
      generatedCoupon: generatedCoupon
        ? { eligible: true, code: generatedCoupon.code, percent: generatedCoupon.percent }
        : { eligible: false },
    };
  }
}
