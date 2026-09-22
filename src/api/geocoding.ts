import type { City } from "../types/index.ts";
import { USER_AGENT } from "../utils/constants.ts";

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