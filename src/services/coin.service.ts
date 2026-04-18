import { geckoClient } from "../integrations/gecko.js";
import { Result } from "../utils/result.js";
import type { CoinPriceInCopResponse } from "../types/coin.type.js";

export type CoinServiceErrorCode = "INTEGRATION_ERROR" | "INTERNAL_ERROR";

export type CoinServiceError = {
  code: CoinServiceErrorCode;
  message: string;
  details?: unknown;
};

export class CoinService {
  async getPricesInCop(
    coins: string[],
    amount: number,
  ): Promise<Result<CoinPriceInCopResponse[], CoinServiceError>> {
    try {
      const prices = await geckoClient.getPrices(coins);
      const usdToCopRate = this.getUsdToCopRate();

      const converted = prices.map((item) => {
        const unitPriceUsd = item.price;
        const totalUsd = unitPriceUsd * amount;
        const totalCop = totalUsd * usdToCopRate;

        return {
          coin: item.coin,
          amount,
          unitPriceUsd,
          totalUsd,
          totalCop,
          usdToCopRate,
          currency: "cop" as const,
        };
      });

      return Result.ok(converted);
    } catch (error) {
      return Result.err({
        code: "INTEGRATION_ERROR",
        message: "Could not fetch prices from external API",
        details: error,
      });
    }
  }

  private getUsdToCopRate(): number {
    const envRate = Number(process.env.USD_TO_COP_RATE ?? "4000");
    return Number.isFinite(envRate) && envRate > 0 ? envRate : 4000;
  }
}
