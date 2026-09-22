import type { City, DailyForecast, Unit } from "../types/index.ts";
import { USER_AGENT } from "../utils/constants.ts";

interface ForecastResponse {
  current?: { temperature_2m?: number };
  current_units?: { temperature_2m?: string };
  daily?: {
    time?: (string | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    weather_code?: (number | null)[];
  };
  daily_units?: { temperature_2m_max?: string };
}

export async function getCurrentTemp(
  city: City,
  unit: Unit,
): Promise<{ temperature: number; unitLabel: string }> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("current", "temperature_2m");
  if (unit === "fahrenheit") url.searchParams.set("temperature_unit", "fahrenheit");

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Error de clima (HTTP ${res.status})`);

  const data: ForecastResponse = (await res.json()) as ForecastResponse;
  const temperature = data.current?.temperature_2m;
  if (temperature === undefined) {
    throw new Error("La respuesta no incluye datos de temperatura");
  }

  return {
    temperature,
    unitLabel: data.current_units?.temperature_2m ?? "°C",
  };
}

export async function getWeekForecast(
  city: City,
  unit: Unit,
): Promise<{ days: DailyForecast[]; unitLabel: string }> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,weather_code");
  url.searchParams.set("forecast_days", "7");
  if (city.timezone) url.searchParams.set("timezone", city.timezone);
  if (unit === "fahrenheit") url.searchParams.set("temperature_unit", "fahrenheit");

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Error de clima (HTTP ${res.status})`);

  const data: ForecastResponse = (await res.json()) as ForecastResponse;
  const daily = data.daily;
  if (!daily || !daily.time || !daily.temperature_2m_max || !daily.temperature_2m_min) {
    throw new Error("La respuesta no incluye datos del pronóstico semanal");
  }

  const days: DailyForecast[] = [];
  const times = daily.time;
  const maxes = daily.temperature_2m_max;
  const mins = daily.temperature_2m_min;
  const codes = daily.weather_code ?? [];

  for (let i = 0; i < times.length; i++) {
    const date = times[i];
    const tempMax = maxes[i];
    const tempMin = mins[i];
    if (date === undefined || date === null || tempMax === undefined || tempMax === null) continue;
    if (tempMin === undefined || tempMin === null) continue;
    days.push({
      date,
      tempMax,
      tempMin,
      weatherCode: codes[i] ?? 0,
    });
  }

  if (days.length === 0) {
    throw new Error("La respuesta no incluye días de pronóstico");
  }

  return {
    days,
    unitLabel: data.daily_units?.temperature_2m_max ?? "°C",
  };
}