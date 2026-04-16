import { Repository } from "typeorm";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../entity/User.js";
import { Result } from "../utils/result.js";
import type { LoginType } from "../types/auth.type.js";

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR";

export type AuthError = {
  code: AuthErrorCode;
  message: string;
  details?: unknown;
};

export type AuthTokenPayload = {
  sub: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  iat?: number;
  exp?: number;
};

export class AuthService {
  private repository: Repository<User>;

  constructor(repository: Repository<User>) {
    this.repository = repository;
  }

  async login(
    credentials: LoginType,
  ): Promise<Result<{ token: string }, AuthError>> {
    try {
      const user = await this.repository.findOneBy({
        username: credentials.username,
      });

      if (!user) {
        return Result.err({
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password,
      );

      if (!isPasswordValid) {
        return Result.err({
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials",
        });
      }

      const secretResult = this.getSecret();

      if (secretResult.isErr) {
        return Result.err(secretResult.error as AuthError);
      }

      const payload: AuthTokenPayload = {
        sub: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      const token = jwt.sign(payload, secretResult.value as string, {
        expiresIn: "1h",
      });

      return Result.ok({ token });
    } catch (error) {
      return Result.err({
        code: "INTERNAL_ERROR",
        message: "Could not authenticate user",
        details: error,
      });
    }
  }

  verifyToken(token: string): Result<AuthTokenPayload, AuthError> {
    const secretResult = this.getSecret();

    if (secretResult.isErr) {
      return Result.err(secretResult.error as AuthError);
    }

    try {
      const decoded = jwt.verify(token, secretResult.value as string);

      if (typeof decoded === "string") {
        return Result.err({
          code: "UNAUTHORIZED",
          message: "Invalid token",
        });
      }

      const subRaw = decoded.sub;
      const sub =
        typeof subRaw === "number"
          ? subRaw
          : typeof subRaw === "string"
            ? Number(subRaw)
            : NaN;

      if (!Number.isInteger(sub) || sub <= 0) {
        return Result.err({
          code: "UNAUTHORIZED",
          message: "Invalid token",
        });
      }

      return Result.ok({
        sub,
        username: typeof decoded.username === "string" ? decoded.username : "",
        firstName:
          typeof decoded.firstName === "string" ? decoded.firstName : "",
        lastName: typeof decoded.lastName === "string" ? decoded.lastName : "",
        role: typeof decoded.role === "string" ? decoded.role : "user",
        iat: typeof decoded.iat === "number" ? decoded.iat : undefined,
        exp: typeof decoded.exp === "number" ? decoded.exp : undefined,
      });
    } catch {
      return Result.err({
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      });
    }
  }

  private getSecret(): Result<string, AuthError> {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return Result.err({
        code: "INTERNAL_ERROR",
        message: "JWT secret is not configured",
      });
    }

    return Result.ok(secret);
  }
}
