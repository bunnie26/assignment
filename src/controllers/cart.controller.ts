import { Request, Response } from "express";
import { CartService } from "../services/cart.service";
import { validateAddToCartInput } from "../validators/cart.validator";

export class CartController {
  constructor(private readonly cartService: CartService) {}

  addItem = (req: Request, res: Response): void => {
    validateAddToCartInput(req.body);
    const cart = this.cartService.addItem(req.body.userId, req.body.item);
    res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  };
}
