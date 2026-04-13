export const buildCouponCode = (percent: number): string => {
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SAVE${percent}-${randomPart}`;
};
