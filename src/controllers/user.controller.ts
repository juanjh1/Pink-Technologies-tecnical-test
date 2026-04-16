import { Request, Response } from "express";
import { ZodError } from "zod";
import { UserCreate, UserUpdate } from "../schemas/user.schema.js";
import type { ServiceError } from "../services/user.service.js";
import { UserService } from "../services/user.service.js";

export class UserController {
  private service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  async create(req: Request, res: Response) {
    try {
      const data = UserCreate.parse(req.body);
      const result = await this.service.create(data);
      return this.handleResult(result, res, 201);
    } catch (error) {
      return this.handleValidationError(error, res);
    }
  }

  async getAll(_req: Request, res: Response) {
    const result = await this.service.getAll();
    return this.handleResult(result, res);
  }

  async getById(req: Request, res: Response) {
    const id = this.parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const result = await this.service.getById(id);
    return this.handleResult(result, res);
  }

  async update(req: Request, res: Response) {
    const id = this.parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Invalid id" });
    }

    try {
      const data = UserUpdate.parse(req.body);
      const result = await this.service.update(id, data);
      return this.handleResult(result, res);
    } catch (error) {
      return this.handleValidationError(error, res);
    }
  }

  async delete(req: Request, res: Response) {
    const id = this.parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const result = await this.service.delete(id);

    if (result.isErr) {
      return this.handleError(result.error as ServiceError, res);
    }

    return res.status(204).send();
  }

  private parseId(rawId: unknown): number | null {
    if (typeof rawId !== "string") {
      return null;
    }

    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }

    return id;
  }

  private handleResult<T>(
    result: {
      isErr: boolean;
      error: ServiceError | null;
      value: T | null;
    },
    res: Response,
    successCode = 200,
  ) {
    if (result.isErr) {
      return this.handleError(result.error as ServiceError, res);
    }

    return res.status(successCode).json(result.value);
  }

  private handleError(error: ServiceError, res: Response) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({
      error: error.message,
      details: error.details ?? null,
    });
  }

  private handleValidationError(error: unknown, res: Response) {
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
