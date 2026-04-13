export interface DiscountConfig {
  nthOrder: number;
  discountPercent: number;
}

export interface DiscountCode {
  code: string;
  percent: number;
  generatedForOrderNumber: number;
  isUsed: boolean;
  usedAt?: string;
}
