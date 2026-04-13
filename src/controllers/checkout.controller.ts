import { Request, Response } from "express";
import { CheckoutService } from "../services/checkout.service";
import { validateCheckoutInput } from "../validators/checkout.validator";

export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  checkout = (req: Request, res: Response): void => {
    validateCheckoutInput(req.body);
    const result = this.checkoutService.checkout(req.body);
    res.status(200).json({
      message: "Checkout successful",
      order: result.order,
      generatedCoupon: result.generatedCoupon,
    });
  };
}
