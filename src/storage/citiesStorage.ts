import type { City } from "../types/index.ts";
import { citiesFilePath } from "./paths.ts";

export function defaultCities(): City[] {
  return [];
}

export async function loadCities(path = citiesFilePath()): Promise<City[]> {
  const file = Bun.file(path);
  if (!(await file.exists())) return defaultCities();

  try {
    const raw = (await file.json()) as unknown;
    return Array.isArray(raw) ? raw.filter(isCity) : defaultCities();
  } catch {
    return defaultCities();
  }
}

export async function saveCities(cities: City[], path = citiesFilePath()): Promise<void> {
  await Bun.write(path, JSON.stringify(cities, null, 2));
}

function isCity(value: unknown): value is City {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v["id"] === "number" &&
    typeof v["name"] === "string" &&
    typeof v["latitude"] === "number" &&
    typeof v["longitude"] === "number" &&
    typeof v["country"] === "string" &&
    (v["admin1"] === undefined || typeof v["admin1"] === "string") &&
    typeof v["timezone"] === "string"
  );
}