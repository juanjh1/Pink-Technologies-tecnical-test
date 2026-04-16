import "reflect-metadata";
import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { UserService } from "../services/user.service.js";
import { User } from "../entity/User.js";
import type { Repository } from "typeorm";

function makeRepositoryMock() {
  const state: { lastCreated?: User; storedUser?: User } = {};

  const repository = {
    create(data: Partial<User>) {
      const user = data as User;
      state.lastCreated = user;
      return user;
    },
    async save(user: User) {
      state.storedUser = user;
      return { ...user, id: user.id ?? 1 } as User;
    },
    async findOneBy({ id }: { id: number }) {
      if (!state.storedUser || state.storedUser.id !== id) {
        return null;
      }
      return state.storedUser;
    },
  } as Partial<Repository<User>>;

  return {
    repository: repository as Repository<User>,
    state,
  };
}

test("UserService.create hashes password before save", async () => {
  const { repository, state } = makeRepositoryMock();
  const service = new UserService(repository);
  const plainPassword = "my-secret-password";

  const result = await service.create({
    firstName: "Ana",
    lastName: "Diaz",
    username: "anadiaz",
    age: 22,
    password: plainPassword,
    role: "user",
  });

  assert.equal(result.isOk, true);
  assert.ok(state.lastCreated);
  assert.notEqual(state.lastCreated?.password, plainPassword);
  assert.equal(
    await bcrypt.compare(plainPassword, state.lastCreated?.password ?? ""),
    true,
  );
});

test("UserService.update hashes password when password is updated", async () => {
  const { repository, state } = makeRepositoryMock();
  const service = new UserService(repository);

  state.storedUser = {
    id: 10,
    firstName: "Luis",
    lastName: "Perez",
    username: "luisp",
    age: 30,
    password: await bcrypt.hash("old-password", 10),
    role: "user",
  };

  const result = await service.update(10, { password: "new-password" });

  assert.equal(result.isOk, true);
  assert.ok(result.value);
  assert.notEqual(result.value?.password, "new-password");
  assert.equal(
    await bcrypt.compare("new-password", result.value?.password ?? ""),
    true,
  );
});
