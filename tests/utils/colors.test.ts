import { describe, expect, test } from "bun:test";
import { paint } from "../../src/utils/colors.ts";

describe("paint", () => {
  test("wraps text in the given ANSI code", () => {
    expect(paint("\x1b[36m", "menú", true)).toBe("\x1b[36mmenú\x1b[0m");
  });

  test("coerces numbers to strings", () => {
    expect(paint("\x1b[33m", 21, true)).toBe("\x1b[33m21\x1b[0m");
  });

  test("handles empty text", () => {
    expect(paint("\x1b[32m", "", true)).toBe("\x1b[32m\x1b[0m");
  });
});