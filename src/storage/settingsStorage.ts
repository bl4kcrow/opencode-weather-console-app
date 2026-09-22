import type { Settings, Unit } from "../types/index.ts";
import { settingsFilePath } from "./paths.ts";

export function defaultSettings(): Settings {
  return { unit: "celsius", defaultCityId: null };
}

export async function loadSettings(path = settingsFilePath()): Promise<Settings> {
  const file = Bun.file(path);
  if (!(await file.exists())) return defaultSettings();

  try {
    return mergeSettings((await file.json()) as unknown);
  } catch {
    return defaultSettings();
  }
}

export async function saveSettings(settings: Settings, path = settingsFilePath()): Promise<void> {
  await Bun.write(path, JSON.stringify(settings, null, 2));
}

export function toggleUnit(unit: Unit): Unit {
  return unit === "celsius" ? "fahrenheit" : "celsius";
}

function mergeSettings(raw: unknown): Settings {
  const settings = defaultSettings();
  if (typeof raw !== "object" || raw === null) return settings;

  const s = raw as Record<string, unknown>;
  if (s["unit"] === "celsius" || s["unit"] === "fahrenheit") {
    settings.unit = s["unit"];
  }
  if (typeof s["defaultCityId"] === "number") {
    settings.defaultCityId = s["defaultCityId"];
  }

  return settings;
}