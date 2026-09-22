import type { City, Unit } from "./types.ts";

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  current?: { temperature_2m?: number };
  current_units?: { temperature_2m?: string };
}

const USER_AGENT = "weather-cli/1.0";

export async function searchCity(name: string): Promise<City[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name.trim());
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Error de geocoding (HTTP ${res.status})`);

  const data: GeocodingResponse = (await res.json()) as GeocodingResponse;
  return (data.results ?? [])
    .filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number")
    .map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country ?? "",
      admin1: r.admin1,
      timezone: r.timezone ?? "",
    }));
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