import type { City } from "./City.ts";
import type { Settings } from "./Settings.ts";

export interface AppData {
  cities: City[];
  settings: Settings;
}