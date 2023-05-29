import {describe, expect, it} from "@jest/globals";
import {getTestCaller, TestCaller, testPrismaClient} from "./utils/testUtils";
import {BasicUserSchema, DetailedUserSchema, ProfileSchema, UpdateProfileSchema} from "../../../../models/user/User";
import {user1, user2, users} from "./utils/mockData";

describe("userRouter", () => {
  let caller: TestCaller;

  beforeEach(async () => {
    caller = getTestCaller(user1);

    await testPrismaClient.$connect();
    await testPrismaClient.user.createMany({data: users});
  });

  afterEach(async () => {
    await testPrismaClient.user.deleteMany();
    await testPrismaClient.$disconnect();
  });

  describe("getAll", () => {
    it("returns all user records ordered by name", async () => {
      // Arrange
      const expected = BasicUserSchema.array().parse([...users].sort((a, b) => (!a.name || !b.name) ? 0 : a.name.localeCompare(b.name)));

      // Act
      const result = await caller.user.getAll();

      // Assert
      expect(result).toEqual(expected);
    })
  });

  describe("profile", () => {
    it("returns caller's user record", async () => {
      // Arrange
      const expected = ProfileSchema.parse({...user1, location: null});

      // Act
      const result = await caller.user.profile();

      // Assert
      expect(result).toEqual(expected);
    })
  });

  describe("getById", () => {
    it("returns a user record with given id", async () => {
      // Arrange
      const expected = DetailedUserSchema.parse({
        ...user2,
        createdEvents: [],
        participatedEvents: [],
      });

      // Act
      const result = await caller.user.getById(user2.id);

      // Assert
      expect(result).toEqual(expected);
    })
  });

  describe("update", () => {
    it("updates the given user record's data", async () => {
      // Arrange
      const expected = UpdateProfileSchema.parse({
        ...user2,
        name: "user2_update_test",
        introduction: "user2_introduction",
        image: "user2_image",
        themeColor: "orange",
        location: null,
      });

      // Act
      const result = await caller.user.update(expected);

      // Assert
      expect(result).toEqual(expected);
    })
  });

  // TODO describe("getPaginatedUsers", () => {});
});
