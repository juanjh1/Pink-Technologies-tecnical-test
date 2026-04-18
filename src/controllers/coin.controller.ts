import { Request, Response } from "express";
import { ZodError } from "zod";
import { CoinQuerySchema } from "../schemas/coin.schema.js";
import { CoinService, type CoinServiceError } from "../services/coin.service.js";

export class CoinController {
  private service: CoinService;

  constructor(service: CoinService) {
    this.service = service;
  }

  async getPricesInCop(req: Request, res: Response) {
    try {
      const parsed = CoinQuerySchema.parse(req.query);
      const coins = parsed.coins
        .split(",")
        .map((coin) => coin.trim().toLowerCase())
        .filter(Boolean);

      if (coins.length === 0) {
        return res.status(400).json({ error: "coins is required" });
      }

      const result = await this.service.getPricesInCop(coins, parsed.amount);

      if (result.isErr) {
        return this.handleError(result.error as CoinServiceError, res);
      }

      return res.status(200).json(result.value);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid query params",
          details: error.flatten(),
        });
      }

      return res.status(500).json({ error: "Internal error" });
    }
  }

  private handleError(error: CoinServiceError, res: Response) {
    if (error.code === "INTEGRATION_ERROR") {
      return res.status(502).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
}
