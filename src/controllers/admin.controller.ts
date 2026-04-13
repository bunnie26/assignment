import { Request, Response } from "express";
import { DiscountService } from "../services/discount.service";
import { StatsService } from "../services/stats.service";
import { validateDiscountConfigInput } from "../validators/admin.validator";

export class AdminController {
  constructor(
    private readonly discountService: DiscountService,
    private readonly statsService: StatsService,
  ) {}

  updateConfig = (req: Request, res: Response): void => {
    validateDiscountConfigInput(req.body);
    const config = this.discountService.setConfig(req.body);
    res.status(200).json({
      message: "Discount configuration updated",
      config,
    });
  };

  getStats = (_req: Request, res: Response): void => {
    const stats = this.statsService.getStats();
    res.status(200).json(stats);
  };
}
