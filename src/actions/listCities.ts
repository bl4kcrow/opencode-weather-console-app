import { formatCity } from "../utils/format.ts";
import { info } from "../presentation/output.ts";
import type { AppData } from "../types/index.ts";

export function showCityList(data: AppData): void {
  info("Ciudades guardadas:");
  data.cities.forEach((city, index) => {
    const isDefault = data.settings.defaultCityId === city.id ? " (default)" : "";
    info(`  ${index + 1}. ${formatCity(city)}${isDefault}`);
  });
}