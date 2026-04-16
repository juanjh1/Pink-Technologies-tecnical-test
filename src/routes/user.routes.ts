import { Router } from "express";
import { AppDataSource } from "../data-source.js";
import { User } from "../entity/User.js";
import { UserController } from "../controllers/user.controller.js";
import { UserService } from "../services/user.service.js";
import { AuthService } from "../services/auth.service.js";
import { AuthMiddleware } from "../middlewares/auth.middleware.js";

export function userRoutes(): Router {
  const router = Router();
  const userRepository = AppDataSource.getRepository(User);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);
  const authService = new AuthService(userRepository);
  const authMiddleware = new AuthMiddleware(authService);

  router.post("/", userController.create.bind(userController));
  router.get("/", authMiddleware.handle.bind(authMiddleware), userController.getAll.bind(userController));
  router.get("/:id", authMiddleware.handle.bind(authMiddleware), userController.getById.bind(userController));
  router.put("/:id", authMiddleware.handle.bind(authMiddleware), userController.update.bind(userController));
  router.delete("/:id", authMiddleware.handle.bind(authMiddleware), userController.delete.bind(userController));

  return router;
}
