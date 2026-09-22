export function ask(question: string): Promise<string | null> {
  const answer = prompt(question);
  if (answer === null) return Promise.resolve(null);
  return Promise.resolve(answer.trim());
}

export function pause(): Promise<void> {
  return ask("Presiona Enter para continuar...").then(() => {});
}

export async function pickFromList(question: string, max: number): Promise<number | null> {
  const raw = (await ask(question)) ?? "";
  if (raw === "") return null;

  const value = Number(raw);
  const index = value - 1;
  if (!Number.isInteger(value) || index < 0 || index >= max) return null;
  return index;
}