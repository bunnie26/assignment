import { CheckoutInput } from "../models/common.types";
import { AppError } from "../utils/errors";

export const validateCheckoutInput = (input: CheckoutInput): void => {
  if (!input.userId || typeof input.userId !== "string") {
    throw new AppError("userId is required", 400);
  }

  if (
    input.discountCode !== undefined &&
    (typeof input.discountCode !== "string" || input.discountCode.trim() === "")
  ) {
    throw new AppError("discountCode must be a non-empty string when provided", 400);
  }
};
