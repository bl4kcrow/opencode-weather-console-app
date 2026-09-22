import { afterAll, describe, expect, test } from "bun:test";
import { defaultData, loadData, saveData } from "./storage.ts";
import type { AppData } from "./types.ts";

const tmpPath = `${import.meta.dir}/.test-storage-${Math.random().toString(36).slice(2)}.json`;

afterAll(async () => {
  try {
    await Bun.file(tmpPath).delete();
  } catch {
    // ignore
  }
});

describe("storage", () => {
  test("returns defaults when file does not exist", async () => {
    expect(await loadData(`${import.meta.dir}/.definitely-missing.json`)).toEqual(defaultData());
  });

  test("round-trips AppData to disk", async () => {
    const data: AppData = {
      cities: [
        {
          id: 6094817,
          name: "Ottawa",
          latitude: 45.41117,
          longitude: -75.69812,
          country: "Canadá",
          admin1: "Ontario",
          timezone: "America/Toronto",
        },
      ],
      settings: { unit: "fahrenheit", defaultCityId: 6094817 },
    };

    await saveData(data, tmpPath);
    expect(await loadData(tmpPath)).toEqual(data);
  });

  test("ignores malformed JSON", async () => {
    await Bun.write(tmpPath, "not-json");
    expect(await loadData(tmpPath)).toEqual(defaultData());
  });

  test("sanitizes unknown shapes", async () => {
    await Bun.write(tmpPath, JSON.stringify({ cities: [{ id: "x" }, "bad"], settings: null }));
    expect(await loadData(tmpPath)).toEqual(defaultData());
  });
});