export const buildOrderId = (orderCount: number): string =>
  `ord_${String(orderCount).padStart(4, "0")}`;
