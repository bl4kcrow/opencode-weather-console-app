export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone: string;
}

export type Unit = "celsius" | "fahrenheit";

export interface Settings {
  unit: Unit;
  defaultCityId: number | null;
}

export interface AppData {
  cities: City[];
  settings: Settings;
}