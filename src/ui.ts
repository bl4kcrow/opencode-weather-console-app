import { cyan } from "./colors.ts";
import type { City, Unit } from "./types.ts";

const WIDTH = 40;

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function toggleUnit(unit: Unit): Unit {
  return unit === "celsius" ? "fahrenheit" : "celsius";
}

function center(text: string): string {
  const pad = Math.max(0, Math.floor((WIDTH - text.length) / 2));
  return " ".repeat(pad) + text;
}

export function renderMenu(cityCount: number, symbol: string): string {
  const divider = cyan("═".repeat(WIDTH));
  return [
    divider,
    cyan(center("WEATHER CLI")),
    divider,
    "  1. Clima de ciudad default",
    `  2. Clima de todas las ciudades (${cityCount})`,
    "  3. Buscar y agregar ciudad",
    "  4. Eliminar ciudad",
    "  5. Establecer ciudad default",
    `  8. Ajustes (${symbol})`,
    "  9. Salir",
    divider,
  ].join("\n");
}

export function formatCity(city: City): string {
  const region = [city.admin1, city.country]
    .filter((part): part is string => part !== undefined && part !== "")
    .join(", ");
  return region ? `${city.name} (${region})` : city.name;
}