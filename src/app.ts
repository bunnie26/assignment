import express, { NextFunction, Request, Response } from "express";
import { AdminController } from "./controllers/admin.controller";
import { CartController } from "./controllers/cart.controller";
import { CheckoutController } from "./controllers/checkout.controller";
import { createAdminRoutes } from "./routes/admin.routes";
import { createCartRoutes } from "./routes/cart.routes";
import { createCheckoutRoutes } from "./routes/checkout.routes";
import { CartService } from "./services/cart.service";
import { CheckoutService } from "./services/checkout.service";
import { DiscountService } from "./services/discount.service";
import { StatsService } from "./services/stats.service";
import { AppError } from "./utils/errors";

const cartService = new CartService();
const discountService = new DiscountService();
const checkoutService = new CheckoutService(cartService, discountService);
const statsService = new StatsService();

const cartController = new CartController(cartService);
const checkoutController = new CheckoutController(checkoutService);
const adminController = new AdminController(discountService, statsService);

export const app = express();
app.use(express.json());

app.use("/cart", createCartRoutes(cartController));
app.use("/checkout", createCheckoutRoutes(checkoutController));
app.use("/admin", createAdminRoutes(adminController));

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
});
