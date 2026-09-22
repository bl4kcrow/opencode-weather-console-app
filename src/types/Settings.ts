export type Unit = "celsius" | "fahrenheit";

export interface Settings {
  unit: Unit;
  defaultCityId: number | null;
}