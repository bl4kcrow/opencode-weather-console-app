import { describe, expect, test } from "bun:test";
import { renderMenu, selectOption } from "../../src/presentation/menu.ts";
import type { MenuOption } from "../../src/types/index.ts";

function options(): MenuOption[] {
  return [
    { key: "1", label: "Clima de ciudad default", run: async () => {} },
    { key: "2", label: "Clima de todas las ciudades (2)", run: async () => {} },
    { key: "8", label: "Ajustes (°F)", run: async () => {} },
    { key: "9", label: "Salir", run: async () => {} },
  ];
}

describe("renderMenu", () => {
  test("renders option labels", () => {
    const menu = renderMenu(options());
    expect(menu).toContain("WEATHER CLI");
    expect(menu).toContain("1. Clima de ciudad default");
    expect(menu).toContain("Clima de todas las ciudades (2)");
    expect(menu).toContain("8. Ajustes (°F)");
    expect(menu).toContain("9. Salir");
  });
});

describe("selectOption", () => {
  test("matches a valid key", async () => {
    const option = await selectOption(options(), async () => "8");
    expect(option?.key).toBe("8");
  });

  test("returns null on empty input", async () => {
    expect(await selectOption(options(), async () => "")).toBeNull();
  });

  test("returns null on unknown key", async () => {
    expect(await selectOption(options(), async () => "99")).toBeNull();
  });
});