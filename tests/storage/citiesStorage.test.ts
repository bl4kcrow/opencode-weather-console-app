import { afterAll, describe, expect, test } from "bun:test";
import { defaultCities, loadCities, saveCities } from "../../src/storage/citiesStorage.ts";
import type { City } from "../../src/types/index.ts";

const tmpPath = `${import.meta.dir}/.test-cities-${Math.random().toString(36).slice(2)}.json`;

afterAll(async () => {
  try {
    await Bun.file(tmpPath).delete();
  } catch {
    // ignore
  }
});

describe("cities storage", () => {
  test("returns default (empty) when file does not exist", async () => {
    expect(await loadCities(`${import.meta.dir}/.definitely-missing-cities.json`)).toEqual(defaultCities());
  });

  test("round-trips a list of cities to disk", async () => {
    const cities: City[] = [
      {
        id: 6094817,
        name: "Ottawa",
        latitude: 45.41117,
        longitude: -75.69812,
        country: "Canadá",
        admin1: "Ontario",
        timezone: "America/Toronto",
      },
    ];

    await saveCities(cities, tmpPath);
    expect(await loadCities(tmpPath)).toEqual(cities);
  });

  test("ignores malformed JSON", async () => {
    await Bun.write(tmpPath, "not-json");
    expect(await loadCities(tmpPath)).toEqual(defaultCities());
  });

  test("sanitizes unknown shapes", async () => {
    await Bun.write(tmpPath, JSON.stringify([{ id: "x" }, "bad"]));
    expect(await loadCities(tmpPath)).toEqual(defaultCities());
  });
});