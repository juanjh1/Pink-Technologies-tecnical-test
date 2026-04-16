import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { User } from "../entity/User.js";
import { AuthService } from "../services/auth.service.js";
import { AuthController } from "../controllers/auth.controller.js";

export function authRoutes(): Router {
  const router = Router();
  const userRepository = AppDataSource.getRepository(User);
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  router.post("/login", authController.login.bind(authController));

  return router;
}
