import { MONTHS, WEEKDAYS } from "./constants.ts";
import { yellow } from "./colors.ts";
import type { City, DailyForecast, Unit } from "../types/index.ts";

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function formatCity(city: City): string {
  const region = [city.admin1, city.country]
    .filter((part): part is string => part !== undefined && part !== "")
    .join(", ");
  return region ? `${city.name} (${region})` : city.name;
}

export function weatherDescription(code: number): string {
  if (code === 0) return "Despejado";
  if (code === 1) return "Mayormente despejado";
  if (code === 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code === 45 || code === 48) return "Niebla";
  if (code >= 51 && code <= 57) return "Llovizna";
  if (code >= 61 && code <= 67) return "Lluvia";
  if (code >= 71 && code <= 77) return "Nieve";
  if (code >= 80 && code <= 82) return "Chubascos";
  if (code === 85 || code === 86) return "Chubascos de nieve";
  if (code >= 95 && code <= 99) return "Tormenta";
  return "N/D";
}

export function formatForecastDay(day: DailyForecast, unitLabel: string): string {
  const date = new Date(`${day.date}T00:00:00`);
  const label = `${WEEKDAYS[date.getDay()] ?? ""} ${date.getDate()} ${MONTHS[date.getMonth()] ?? ""}`;
  const temps = yellow(`max ${roundTemp(day.tempMax)}${unitLabel} / min ${roundTemp(day.tempMin)}${unitLabel}`);
  return `  ${label}: ${temps} — ${weatherDescription(day.weatherCode)}`;
}

function roundTemp(value: number): number {
  return Math.round(value * 10) / 10;
}