export interface Stats {
  totalItemsPurchased: number;
  totalRevenue: number;
  totalOrders: number;
  totalDiscountAmountGiven: number;
  discountCodes: {
    totalGenerated: number;
    totalUsed: number;
    activeCodes: string[];
  };
}
