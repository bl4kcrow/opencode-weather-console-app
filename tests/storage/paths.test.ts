import { afterEach, describe, expect, test } from "bun:test";
import { citiesFilePath, configDir, joinPath, settingsFilePath } from "../../src/storage/paths.ts";

const ORIGINAL_USERPROFILE = Bun.env.USERPROFILE;
const ORIGINAL_HOME = Bun.env.HOME;

afterEach(() => {
  restoreEnv("USERPROFILE", ORIGINAL_USERPROFILE);
  restoreEnv("HOME", ORIGINAL_HOME);
});

function restoreEnv(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

function setEnv(key: string, value: string): void {
  process.env[key] = value;
}

describe("joinPath", () => {
  test("joins without duplicating separators", () => {
    expect(joinPath("/home/user", "cities.json")).toBe("/home/user/cities.json");
  });

  test("handles a trailing separator", () => {
    expect(joinPath("/home/user/", "cities.json")).toBe("/home/user/cities.json");
    expect(joinPath("C:\\Users\\user\\", "cities.json")).toBe("C:\\Users\\user\\cities.json");
  });

  test("keeps a Windows-style dir as-is", () => {
    expect(joinPath("C:\\Users\\user", "cities.json")).toBe("C:\\Users\\user/cities.json");
  });
});

describe("configDir", () => {
  test("uses USERPROFILE when set", () => {
    setEnv("USERPROFILE", "C:\\Users\\tester");
    expect(configDir()).toBe("C:\\Users\\tester/.weather-cli");
  });

  test("falls back to HOME when USERPROFILE is missing", () => {
    delete process.env.USERPROFILE;
    setEnv("HOME", "/home/tester");
    expect(configDir()).toBe("/home/tester/.weather-cli");
  });
});

describe("data file paths", () => {
  test("points to cities.json inside the config dir", () => {
    setEnv("USERPROFILE", "C:\\Users\\tester");
    expect(citiesFilePath()).toBe(joinPath("C:\\Users\\tester/.weather-cli", "cities.json"));
  });

  test("points to settings.json inside the config dir", () => {
    setEnv("USERPROFILE", "C:\\Users\\tester");
    expect(settingsFilePath()).toBe(joinPath("C:\\Users\\tester/.weather-cli", "settings.json"));
  });
});