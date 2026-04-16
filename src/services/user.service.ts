import { Repository } from "typeorm";
import bcrypt from "bcrypt";
import { User } from "../entity/User.js";
import type { UserCreateType, UserUpdateType } from "../types/user.type.js";
import { Result } from "../utils/result.js";

export type ServiceErrorCode = "NOT_FOUND" | "INTERNAL_ERROR";

export type ServiceError = {
  code: ServiceErrorCode;
  message: string;
  details?: unknown;
};

export class UserService {
  private repository: Repository<User>;

  constructor(repository: Repository<User>) {
    this.repository = repository;
  }

  async create(data: UserCreateType): Promise<Result<User, ServiceError>> {
    try {
      const hashedPassword = await bcrypt.hash(
        data.password,
        this.getSaltRounds(),
      );

      const user = this.repository.create({
        ...data,
        password: hashedPassword,
      });
      const created = await this.repository.save(user);
      return Result.ok(created);
    } catch (error) {
      return Result.err(this.internalError("Could not create user", error));
    }
  }

  async getAll(): Promise<Result<User[], ServiceError>> {
    try {
      const users = await this.repository.find();
      return Result.ok(users);
    } catch (error) {
      return Result.err(this.internalError("Could not get users", error));
    }
  }

  async getById(id: number): Promise<Result<User, ServiceError>> {
    try {
      const user = await this.repository.findOneBy({ id });

      if (!user) {
        return Result.err({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return Result.ok(user);
    } catch (error) {
      return Result.err(this.internalError("Could not get user", error));
    }
  }

  async update(
    id: number,
    data: UserUpdateType,
  ): Promise<Result<User, ServiceError>> {
    try {
      const user = await this.repository.findOneBy({ id });

      if (!user) {
        return Result.err({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const updateData = { ...data };

      if (typeof updateData.password === "string") {
        updateData.password = await bcrypt.hash(
          updateData.password,
          this.getSaltRounds(),
        );
      }

      Object.assign(user, updateData);
      const updated = await this.repository.save(user);
      return Result.ok(updated);
    } catch (error) {
      return Result.err(this.internalError("Could not update user", error));
    }
  }

  async delete(id: number): Promise<Result<null, ServiceError>> {
    try {
      const user = await this.repository.findOneBy({ id });

      if (!user) {
        return Result.err({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      await this.repository.remove(user);
      return Result.ok(null);
    } catch (error) {
      return Result.err(this.internalError("Could not delete user", error));
    }
  }

  private internalError(message: string, details: unknown): ServiceError {
    return {
      code: "INTERNAL_ERROR",
      message,
      details,
    };
  }

  private getSaltRounds(): number {
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? "10");
    return Number.isInteger(rounds) && rounds > 0 ? rounds : 10;
  }
}
