import { formatCity } from "../utils/format.ts";
import { info, success } from "../presentation/output.ts";
import { pause, pickFromList } from "../presentation/input.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { showCityList } from "./listCities.ts";
import type { AppData } from "../types/index.ts";

export async function removeCity(data: AppData): Promise<void> {
  if (data.cities.length === 0) {
    info("No hay ciudades guardadas.\n");
    await pause();
    return;
  }

  showCityList(data);
  const index = await pickFromList(
    `Elige una ciudad (1-${data.cities.length}) o Enter para cancelar`,
    data.cities.length,
  );
  if (index === null) {
    info("Operación cancelada.\n");
    await pause();
    return;
  }

  const city = data.cities[index]!;
  if (data.settings.defaultCityId === city.id) data.settings.defaultCityId = null;
  data.cities.splice(index, 1);
  await saveCities(data.cities);
  await saveSettings(data.settings);
  success(`"${formatCity(city)}" eliminada.\n`);
  await pause();
}