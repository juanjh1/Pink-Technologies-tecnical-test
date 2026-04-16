export type PriceResponse = {
  coin: string
  price: number
  currency: string
}

export type CoinPriceInCopResponse = {
  coin: string;
  amount: number;
  unitPriceUsd: number;
  totalUsd: number;
  totalCop: number;
  usdToCopRate: number;
  currency: "cop";
};
