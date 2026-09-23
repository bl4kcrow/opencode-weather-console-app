import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { error, errorMessage, info, success, warning } from "../../src/presentation/output.ts";

describe("errorMessage", () => {
  test("extracts the message from an Error", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });

  test("passes through plain strings", () => {
    expect(errorMessage("boom")).toBe("boom");
  });

  test("stringifies other values", () => {
    expect(errorMessage(42)).toBe("42");
    expect(errorMessage(undefined)).toBe("undefined");
  });
});

describe("output helpers", () => {
  const spies: { log: ReturnType<typeof spyOn> | null } = { log: null };

  afterEach(() => {
    spies.log?.mockRestore();
  });

  test("info logs the text", () => {
    spies.log = spyOn(console, "log");
    info("hola");
    expect(spies.log).toHaveBeenCalledWith("hola");
  });

  test("success logs the text", () => {
    spies.log = spyOn(console, "log");
    success("hecho");
    expect(spies.log).toHaveBeenCalledWith("hecho");
  });

  test("warning logs the text", () => {
    spies.log = spyOn(console, "log");
    warning("cuidado");
    expect(spies.log).toHaveBeenCalledWith("cuidado");
  });

  test("error logs the text", () => {
    spies.log = spyOn(console, "log");
    error("falló");
    expect(spies.log).toHaveBeenCalledWith("falló");
  });
});