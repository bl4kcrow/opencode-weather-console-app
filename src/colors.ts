const enabled =
  process.stdout.isTTY === true && !("NO_COLOR" in Bun.env);

const codes = {
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m",
} as const;

export function paint(code: string, text: string | number, force = false): string {
  const value = String(text);
  return enabled || force ? `${code}${value}\x1b[0m` : value;
}

export const cyan = (text: string | number) => paint(codes.cyan, text);
export const yellow = (text: string | number) => paint(codes.yellow, text);
export const green = (text: string | number) => paint(codes.green, text);
export const red = (text: string | number) => paint(codes.red, text);