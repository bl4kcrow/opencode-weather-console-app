import { afterEach, describe, expect, mock, test } from "bun:test";
import { getCurrentTemp, getWeekForecast } from "../../src/api/weather.ts";
import type { City, DailyForecast } from "../../src/types/index.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function city(overrides: Partial<City> = {}): City {
  return {
    id: 1,
    name: "Ottawa",
    latitude: 45.41,
    longitude: -75.69,
    country: "Canadá",
    admin1: "Ontario",
    timezone: "America/Toronto",
    ...overrides,
  };
}

function mockFetch(status: number, body: unknown): ReturnType<typeof mock> {
  const fn = mock(async () => new Response(JSON.stringify(body), { status }));
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

function urlOf(fn: ReturnType<typeof mock>): URL {
  const [input] = fn.mock.calls[0] as [URL];
  return new URL(String(input));
}

describe("getCurrentTemp", () => {
  test("requests temperature without forcing a unit by default", async () => {
    const fn = mockFetch(200, {
      current: { temperature_2m: 21.5 },
      current_units: { temperature_2m: "°C" },
    });

    const result = await getCurrentTemp(city(), "celsius");

    const url = urlOf(fn);
    expect(url.origin).toBe("https://api.open-meteo.com");
    expect(url.pathname).toBe("/v1/forecast");
    expect(url.searchParams.get("latitude")).toBe("45.41");
    expect(url.searchParams.get("longitude")).toBe("-75.69");
    expect(url.searchParams.get("current")).toBe("temperature_2m");
    expect(url.searchParams.has("temperature_unit")).toBe(false);

    expect(result).toEqual({ temperature: 21.5, unitLabel: "°C" });
  });

  test("adds temperature_unit=fahrenheit for Fahrenheit", async () => {
    const fn = mockFetch(200, {
      current: { temperature_2m: 70 },
      current_units: { temperature_2m: "°F" },
    });

    const result = await getCurrentTemp(city(), "fahrenheit");
    expect(urlOf(fn).searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(result).toEqual({ temperature: 70, unitLabel: "°F" });
  });

  test("defaults the unit label when missing", async () => {
    mockFetch(200, { current: { temperature_2m: 10 } });
    expect(await getCurrentTemp(city(), "celsius")).toEqual({ temperature: 10, unitLabel: "°C" });
  });

  test("throws when temperature is missing", async () => {
    mockFetch(200, { current: {} });
    expect(getCurrentTemp(city(), "celsius")).rejects.toThrow("La respuesta no incluye datos de temperatura");
  });

  test("throws on a non-2xx response", async () => {
    mockFetch(503, {});
    expect(getCurrentTemp(city(), "celsius")).rejects.toThrow("Error de clima (HTTP 503)");
  });
});

describe("getWeekForecast", () => {
  const daily = {
    time: ["2026-09-21", "2026-09-22", "2026-09-23"],
    temperature_2m_max: [20, 22, 24],
    temperature_2m_min: [10, 12, 13],
    weather_code: [0, 61, 95],
  };

  test("builds a daily forecast and reads the unit label", async () => {
    const fn = mockFetch(200, { daily, daily_units: { temperature_2m_max: "°C" } });

    const result = await getWeekForecast(city(), "celsius");

    const url = urlOf(fn);
    expect(url.searchParams.get("latitude")).toBe("45.41");
    expect(url.searchParams.get("longitude")).toBe("-75.69");
    expect(url.searchParams.get("daily")).toBe("temperature_2m_max,temperature_2m_min,weather_code");
    expect(url.searchParams.get("forecast_days")).toBe("7");
    expect(url.searchParams.get("timezone")).toBe("America/Toronto");
    expect(url.searchParams.has("temperature_unit")).toBe(false);

    expect(result.days).toEqual<DailyForecast[]>([
      { date: "2026-09-21", tempMax: 20, tempMin: 10, weatherCode: 0 },
      { date: "2026-09-22", tempMax: 22, tempMin: 12, weatherCode: 61 },
      { date: "2026-09-23", tempMax: 24, tempMin: 13, weatherCode: 95 },
    ]);
    expect(result.unitLabel).toBe("°C");
  });

  test("adds temperature_unit and skips timezone when not provided", async () => {
    const fn = mockFetch(200, { daily, daily_units: { temperature_2m_max: "°F" } });

    await getWeekForecast(city({ timezone: "" }), "fahrenheit");

    const url = urlOf(fn);
    expect(url.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(url.searchParams.has("timezone")).toBe(false);
  });

  test("drops incomplete entries and defaults missing weather codes", async () => {
    mockFetch(200, {
      daily: {
        time: ["2026-09-21", null, "2026-09-23"],
        temperature_2m_max: [20, null, 24],
        temperature_2m_min: [10, 12, null],
        weather_code: [],
      },
    });

    const { days } = await getWeekForecast(city(), "celsius");
    expect(days).toEqual<DailyForecast[]>([{ date: "2026-09-21", tempMax: 20, tempMin: 10, weatherCode: 0 }]);
  });

  test("throws when daily data is missing", async () => {
    mockFetch(200, { current: {} });
    expect(getWeekForecast(city(), "celsius")).rejects.toThrow(
      "La respuesta no incluye datos del pronóstico semanal",
    );
  });

  test("throws when no usable days remain", async () => {
    mockFetch(200, { daily: { time: [], temperature_2m_max: [], temperature_2m_min: [] } });
    expect(getWeekForecast(city(), "celsius")).rejects.toThrow("La respuesta no incluye días de pronóstico");
  });
});