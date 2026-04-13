import { Router } from "express";
import { CartController } from "../controllers/cart.controller";

export const createCartRoutes = (cartController: CartController): Router => {
  const router = Router();
  router.post("/add", cartController.addItem);
  return router;
};
