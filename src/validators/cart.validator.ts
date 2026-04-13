import { AddToCartInput } from "../models/common.types";
import { AppError } from "../utils/errors";

export const validateAddToCartInput = (input: AddToCartInput): void => {
  if (!input.userId || typeof input.userId !== "string") {
    throw new AppError("userId is required", 400);
  }

  const { item } = input;
  if (!item || typeof item !== "object") {
    throw new AppError("item is required", 400);
  }

  if (!item.itemId || typeof item.itemId !== "string") {
    throw new AppError("item.itemId is required", 400);
  }

  if (!item.name || typeof item.name !== "string") {
    throw new AppError("item.name is required", 400);
  }

  if (typeof item.unitPrice !== "number" || item.unitPrice <= 0) {
    throw new AppError("item.unitPrice must be a number greater than 0", 400);
  }

  if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
    throw new AppError("item.quantity must be an integer greater than 0", 400);
  }
};
