import type { AppData, City } from "./types.ts";

export function configPath(): string {
  const home = Bun.env.USERPROFILE ?? Bun.env.HOME ?? import.meta.dir;
  return joinPath(home, ".weather-cli.json");
}

function joinPath(dir: string, file: string): string {
  return dir.endsWith("/") || dir.endsWith("\\") ? dir + file : dir + "/" + file;
}

export function defaultData(): AppData {
  return { cities: [], settings: { unit: "celsius", defaultCityId: null } };
}

export async function loadData(path = configPath()): Promise<AppData> {
  const file = Bun.file(path);
  if (!(await file.exists())) return defaultData();

  try {
    return mergeData(await file.json());
  } catch {
    return defaultData();
  }
}

export async function saveData(data: AppData, path = configPath()): Promise<void> {
  await Bun.write(path, JSON.stringify(data, null, 2));
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

function mergeData(raw: unknown): AppData {
  const data = defaultData();
  if (typeof raw !== "object" || raw === null) return data;

  const record = raw as Record<string, unknown>;
  const cities = record["cities"];
  const settings = record["settings"];

  if (Array.isArray(cities)) data.cities = cities.filter(isCity);

  if (typeof settings === "object" && settings !== null) {
    const s = settings as Record<string, unknown>;
    if (s["unit"] === "celsius" || s["unit"] === "fahrenheit") {
      data.settings.unit = s["unit"];
    }
    if (typeof s["defaultCityId"] === "number") {
      data.settings.defaultCityId = s["defaultCityId"];
    }
  }

  return data;
}