import { afterEach, describe, expect, test } from "bun:test";
import { ask, pause, pickFromList } from "../../src/presentation/input.ts";

const originalPrompt = globalThis.prompt;

afterEach(() => {
  globalThis.prompt = originalPrompt;
});

function setPrompt(reply: string | null): void {
  globalThis.prompt = (() => reply) as typeof prompt;
}

describe("ask", () => {
  test("trims the answer", async () => {
    setPrompt("  Ottawa  ");
    expect(await ask("¿Ciudad?")).toBe("Ottawa");
  });

  test("returns null when the user cancels", async () => {
    setPrompt(null);
    expect(await ask("¿Ciudad?")).toBeNull();
  });

  test("returns empty string for a blank answer", async () => {
    setPrompt("");
    expect(await ask("¿Ciudad?")).toBe("");
  });
});

describe("pause", () => {
  test("resolves when the user presses enter", async () => {
    setPrompt("whatever");
    await expect(pause()).resolves.toBeUndefined();
  });
});

describe("pickFromList", () => {
  test("maps a 1-based choice to an index", async () => {
    setPrompt("8");
    expect(await pickFromList("Elige", 10)).toBe(7);
  });

  test("returns null on empty input", async () => {
    setPrompt("");
    expect(await pickFromList("Elige", 3)).toBeNull();
  });

  test("rejects values below the list start", async () => {
    setPrompt("0");
    expect(await pickFromList("Elige", 3)).toBeNull();
  });

  test("rejects values beyond the list end", async () => {
    setPrompt("4");
    expect(await pickFromList("Elige", 3)).toBeNull();
  });

  test("rejects non-integer values", async () => {
    setPrompt("2.5");
    expect(await pickFromList("Elige", 3)).toBeNull();
  });

  test("rejects non-numeric input", async () => {
    setPrompt("abc");
    expect(await pickFromList("Elige", 3)).toBeNull();
  });
});