import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { User } from "../entity/User.js";
import { AuthService } from "../services/auth.service.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";
import { CoinService } from "../services/coin.service.js";
import { CoinController } from "../controllers/coin.controller.js";

export function coinRoutes(): Router {
  const router = Router();
  const userRepository = AppDataSource.getRepository(User);
  const authService = new AuthService(userRepository);
  const authMiddleware = new AuthMiddleware(authService);
  const coinService = new CoinService();
  const coinController = new CoinController(coinService);

  router.get(
    "/convert",
    authMiddleware.handle.bind(authMiddleware),
    coinController.getPricesInCop.bind(coinController),
  );

  return router;
}
