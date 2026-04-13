import { DiscountConfig } from "../models/discount.model";
import { AppError } from "../utils/errors";

export const validateDiscountConfigInput = (input: DiscountConfig): void => {
  if (!Number.isInteger(input.nthOrder) || input.nthOrder <= 0) {
    throw new AppError("nthOrder must be an integer greater than 0", 400);
  }

  if (typeof input.discountPercent !== "number" || input.discountPercent <= 0 || input.discountPercent > 100) {
    throw new AppError("discountPercent must be a number greater than 0 and at most 100", 400);
  }
};
