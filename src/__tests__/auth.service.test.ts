import "reflect-metadata";
import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { AuthService } from "../services/auth.service.js";
import { User } from "../entity/User.js";
import type { Repository } from "typeorm";

function makeRepositoryMock(user: User | null) {
  const repository = {
    async findOneBy({ username }: { username: string }) {
      if (!user) {
        return null;
      }
      return user.username === username ? user : null;
    },
  } as Partial<Repository<User>>;

  return repository as Repository<User>;
}

test("AuthService.login returns token with valid username/password", async () => {
  process.env.JWT_SECRET = "unit-test-secret";
  const hashedPassword = await bcrypt.hash("super-pass", 10);
  const user: User = {
    id: 1,
    firstName: "Juan",
    lastName: "Lopez",
    username: "juanl",
    age: 28,
    password: hashedPassword,
    role: "admin",
  };

  const service = new AuthService(makeRepositoryMock(user));
  const loginResult = await service.login({
    username: "juanl",
    password: "super-pass",
  });

  assert.equal(loginResult.isOk, true);
  assert.ok(loginResult.value?.token);

  const verifyResult = service.verifyToken(loginResult.value?.token ?? "");
  assert.equal(verifyResult.isOk, true);
  assert.equal(verifyResult.value?.sub, 1);
  assert.equal(verifyResult.value?.username, "juanl");
});

test("AuthService.login returns INVALID_CREDENTIALS for bad password", async () => {
  process.env.JWT_SECRET = "unit-test-secret";
  const hashedPassword = await bcrypt.hash("super-pass", 10);
  const user: User = {
    id: 1,
    firstName: "Juan",
    lastName: "Lopez",
    username: "juanl",
    age: 28,
    password: hashedPassword,
    role: "admin",
  };

  const service = new AuthService(makeRepositoryMock(user));
  const loginResult = await service.login({
    username: "juanl",
    password: "wrong-pass",
  });

  assert.equal(loginResult.isErr, true);
  assert.equal(loginResult.error?.code, "INVALID_CREDENTIALS");
});
