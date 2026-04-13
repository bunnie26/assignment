import { Stats } from "../models/stats.model";
import { memoryStore } from "../store/memory.store";
import { roundMoney } from "../utils/money.util";

export class StatsService {
  getStats(): Stats {
    const totalItemsPurchased = memoryStore.orders.reduce((sum, order) => {
      const orderItemCount = order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      return sum + orderItemCount;
    }, 0);

    const totalRevenue = roundMoney(memoryStore.orders.reduce((sum, order) => sum + order.total, 0));
    const totalDiscountAmountGiven = roundMoney(
      memoryStore.orders.reduce((sum, order) => sum + order.discountAmount, 0),
    );

    const allDiscountCodes = [...memoryStore.discountCodes.values()];
    const totalUsed = allDiscountCodes.filter((code) => code.isUsed).length;
    const activeCodes = allDiscountCodes.filter((code) => !code.isUsed).map((code) => code.code);

    return {
      totalItemsPurchased,
      totalRevenue,
      totalOrders: memoryStore.orders.length,
      totalDiscountAmountGiven,
      discountCodes: {
        totalGenerated: allDiscountCodes.length,
        totalUsed,
        activeCodes,
      },
    };
  }
}
