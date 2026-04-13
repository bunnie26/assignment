import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";

export const createAdminRoutes = (adminController: AdminController): Router => {
  const router = Router();
  router.post("/config", adminController.updateConfig);
  router.get("/stats", adminController.getStats);
  return router;
};
