import { NextFunction, Request, Response } from "express";
import {
  AuthService,
  type AuthError,
  type AuthTokenPayload,
} from "../services/auth.service.js";

export type AuthenticatedRequest = Request & {
  auth?: AuthTokenPayload;
};

export class AuthMiddleware {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  handle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token required" });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }

    const result = this.authService.verifyToken(token);

    if (result.isErr) {
      return this.handleError(result.error as AuthError, res);
    }

    req.auth = result.value as AuthTokenPayload;
    return next();
  }

  private handleError(error: AuthError, res: Response) {
    if (error.code === "UNAUTHORIZED") {
      return res.status(401).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
}
