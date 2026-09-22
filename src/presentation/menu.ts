import { ask } from "./input.ts";
import { error } from "./output.ts";
import { cyan } from "../utils/colors.ts";
import type { MenuOption } from "../types/index.ts";

const WIDTH = 40;
const TITLE = "WEATHER CLI";

function center(text: string): string {
  const pad = Math.max(0, Math.floor((WIDTH - text.length) / 2));
  return " ".repeat(pad) + text;
}

export function renderMenu(options: MenuOption[]): string {
  const divider = cyan("═".repeat(WIDTH));
  const lines = [divider, cyan(center(TITLE)), divider];

  for (const option of options) {
    lines.push(`  ${option.key}. ${option.label}`);
  }

  lines.push(divider);
  return lines.join("\n");
}

export async function selectOption(
  options: MenuOption[],
  askFn: (question: string) => Promise<string | null> = ask,
): Promise<MenuOption | null> {
  const choice = (await askFn("Selecciona una opción")) ?? "";
  if (choice === "") return null;

  const option = options.find((o) => o.key === choice);
  if (!option) error("Opción no válida.\n");
  return option ?? null;
}