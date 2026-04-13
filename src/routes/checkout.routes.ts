import { Router } from "express";
import { CheckoutController } from "../controllers/checkout.controller";

export const createCheckoutRoutes = (checkoutController: CheckoutController): Router => {
  const router = Router();
  router.post("/", checkoutController.checkout);
  return router;
};
