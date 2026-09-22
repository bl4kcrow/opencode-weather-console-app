export function joinPath(dir: string, file: string): string {
  return dir.endsWith("/") || dir.endsWith("\\") ? dir + file : dir + "/" + file;
}

export function configDir(): string {
  const home = Bun.env.USERPROFILE ?? Bun.env.HOME ?? import.meta.dir;
  return joinPath(home, ".weather-cli");
}

export function citiesFilePath(): string {
  return joinPath(configDir(), "cities.json");
}

export function settingsFilePath(): string {
  return joinPath(configDir(), "settings.json");
}