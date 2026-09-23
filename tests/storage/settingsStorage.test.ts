import { afterAll, describe, expect, test } from "bun:test";
import { defaultSettings, loadSettings, saveSettings, toggleUnit } from "../../src/storage/settingsStorage.ts";
import type { Settings } from "../../src/types/index.ts";

const tmpPath = `${import.meta.dir}/.test-settings-${Math.random().toString(36).slice(2)}.json`;

afterAll(async () => {
  try {
    await Bun.file(tmpPath).delete();
  } catch {
    // ignore
  }
});

describe("settings storage", () => {
  test("returns defaults when file does not exist", async () => {
    expect(await loadSettings(`${import.meta.dir}/.definitely-missing-settings.json`)).toEqual(
      defaultSettings(),
    );
  });

  test("round-trips settings to disk", async () => {
    const settings: Settings = { unit: "fahrenheit", defaultCityId: 6094817 };

    await saveSettings(settings, tmpPath);
    expect(await loadSettings(tmpPath)).toEqual(settings);
  });

  test("ignores malformed JSON", async () => {
    await Bun.write(tmpPath, "not-json");
    expect(await loadSettings(tmpPath)).toEqual(defaultSettings());
  });

  test("sanitizes unknown shapes", async () => {
    await Bun.write(tmpPath, JSON.stringify({ unit: "kelvin", defaultCityId: "x" }));
    expect(await loadSettings(tmpPath)).toEqual(defaultSettings());
  });

  test("toggles back and forth", () => {
    expect(toggleUnit("celsius")).toBe("fahrenheit");
    expect(toggleUnit("fahrenheit")).toBe("celsius");
  });
});