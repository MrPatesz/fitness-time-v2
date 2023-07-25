import {describe, expect, it} from "@jest/globals";
import {Example} from "@prisma/client";
import {inferProcedureInput, TRPCError} from "@trpc/server";
import {AppRouter} from "../../root";
import {getTestCaller, TestCaller, testPrismaClient} from "./utils/testUtils";

const examples: Example[] = [
  {id: "example1_id", createdAt: new Date(), updatedAt: new Date()},
  {id: "example2_id", createdAt: new Date(), updatedAt: new Date()},
];

describe("exampleRouter", () => {
  let caller: TestCaller;

  beforeAll(async () => {
    caller = getTestCaller();

    await testPrismaClient.example.createMany({data: examples});
  });

  afterAll(async () => {
    await testPrismaClient.example.deleteMany();

    await testPrismaClient.$disconnect();
  });

  describe("getAll", () => {
    it("returns all example records", async () => {
      // Act
      const result = await caller.example.getAll();

      // Assert
      expect(result).toEqual(examples);
    })
  });

  describe("hello", () => {
    it("returns expected greeting", async () => {
      // Arrange
      type Input = inferProcedureInput<AppRouter["example"]["hello"]>;
      const input: Input = {text: "patesz"};

      // Act
      const result = await caller.example.hello(input);

      // Assert
      expect(result).toEqual({
        greeting: `Hello ${input.text}`,
      });
    });
  });

  describe("getSecretMessage", () => {
    it("returns secret message when user is logged in", async () => {
      // Act
      const result = await caller.example.getSecretMessage();

      // Assert
      expect(result).toBe("you can now see this secret message!");
    })
  });

  describe("getSecretMessage", () => {
    beforeAll(() => {
      caller = getTestCaller(null);
    });

    it("throws error when user is unauthenticated", async () => {
      // Act
      const getSecretMessage = async () => {
        await caller.example.getSecretMessage();
      };

      // Assert
      await expect(getSecretMessage).rejects.toThrow(new TRPCError({code: "UNAUTHORIZED"}));
    })
  });
});
