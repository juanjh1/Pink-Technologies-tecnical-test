import { Request, Response } from "express";
import { ZodError } from "zod";
import { LoginSchema } from "../schemas/auth.schema.js";
import { AuthService, type AuthError } from "../services/auth.service.js";

export class AuthController {
  private service: AuthService;

  constructor(service: AuthService) {
    this.service = service;
  }

  async login(req: Request, res: Response) {
    try {
      const credentials = LoginSchema.parse(req.body);
      const result = await this.service.login(credentials);

      if (result.isErr) {
        return this.handleError(result.error as AuthError, res);
      }

      return res.status(200).json(result.value);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid data",
          details: error.flatten(),
        });
      }

      return res.status(500).json({
        error: "Internal error",
      });
    }
  }

  private handleError(error: AuthError, res: Response) {
    if (error.code === "INVALID_CREDENTIALS") {
      return res.status(401).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
}
