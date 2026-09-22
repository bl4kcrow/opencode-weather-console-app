import { green, red, yellow } from "../utils/colors.ts";

export function info(text: string): void {
  console.log(text);
}

export function success(text: string): void {
  console.log(green(text));
}

export function error(text: string): void {
  console.log(red(text));
}

export function warning(text: string): void {
  console.log(yellow(text));
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}