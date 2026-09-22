import { describe, expect, test } from "bun:test";
import { formatCity, formatForecastDay, unitSymbol, weatherDescription } from "./format.ts";
import type { City, DailyForecast, Unit } from "../types/index.ts";

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

describe("formatCity", () => {
  test("includes admin1 and country", () => {
    expect(formatCity(city())).toBe("Ottawa (Ontario, Canadá)");
  });

  test("drops admin1 when absent", () => {
    expect(formatCity(city({ admin1: undefined }))).toBe("Ottawa (Canadá)");
  });

  test("falls back to name only", () => {
    expect(formatCity(city({ admin1: undefined, country: "" }))).toBe("Ottawa");
  });
});

describe("unitSymbol", () => {
  test("maps unit to symbol", () => {
    expect(unitSymbol("celsius" as Unit)).toBe("°C");
    expect(unitSymbol("fahrenheit" as Unit)).toBe("°F");
  });
});

describe("weatherDescription", () => {
  test("maps WMO codes to Spanish", () => {
    expect(weatherDescription(0)).toBe("Despejado");
    expect(weatherDescription(1)).toBe("Mayormente despejado");
    expect(weatherDescription(2)).toBe("Parcialmente nublado");
    expect(weatherDescription(3)).toBe("Nublado");
    expect(weatherDescription(45)).toBe("Niebla");
    expect(weatherDescription(51)).toBe("Llovizna");
    expect(weatherDescription(61)).toBe("Lluvia");
    expect(weatherDescription(71)).toBe("Nieve");
    expect(weatherDescription(80)).toBe("Chubascos");
    expect(weatherDescription(85)).toBe("Chubascos de nieve");
    expect(weatherDescription(95)).toBe("Tormenta");
  });

  test("falls back for unknown codes", () => {
    expect(weatherDescription(999)).toBe("N/D");
  });
});

describe("formatForecastDay", () => {
  test("renders date, temps and description", () => {
    const day: DailyForecast = {
      date: "2026-09-23",
      tempMax: 20.5,
      tempMin: 12,
      weatherCode: 61,
    };
    expect(formatForecastDay(day, "°C")).toBe(
      "  miércoles 23 septiembre: max 20.5°C / min 12°C — Lluvia",
    );
  });

  test("respects the unit label", () => {
    const day: DailyForecast = {
      date: "2026-09-24",
      tempMax: 68,
      tempMin: 54,
      weatherCode: 0,
    };
    expect(formatForecastDay(day, "°F")).toContain("max 68°F / min 54°F");
  });
});