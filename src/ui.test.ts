import { describe, expect, test } from "bun:test";
import { formatCity, renderMenu, toggleUnit, unitSymbol } from "./ui.ts";
import type { City, Unit } from "./types.ts";

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

describe("unit helpers", () => {
  test("maps unit to symbol", () => {
    expect(unitSymbol("celsius" as Unit)).toBe("°C");
    expect(unitSymbol("fahrenheit" as Unit)).toBe("°F");
  });

  test("toggles back and forth", () => {
    expect(toggleUnit("celsius")).toBe("fahrenheit");
    expect(toggleUnit("fahrenheit")).toBe("celsius");
  });
});

describe("renderMenu", () => {
  test("reflects city count and unit symbol", () => {
    const menu = renderMenu(2, "°F");
    expect(menu).toContain("WEATHER CLI");
    expect(menu).toContain("Clima de todas las ciudades (2)");
    expect(menu).toContain("8. Ajustes (°F)");
    expect(menu).toContain("9. Salir");
  });
});