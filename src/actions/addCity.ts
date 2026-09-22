import { searchCity } from "../api/geocoding.ts";
import { error, errorMessage, info, success, warning } from "../presentation/output.ts";
import { ask, pause, pickFromList } from "../presentation/input.ts";
import { saveCities } from "../storage/citiesStorage.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { formatCity } from "../utils/format.ts";
import type { AppData, City } from "../types/index.ts";

export async function addCity(data: AppData, setAsDefault = false): Promise<City | null> {
  const name = (await ask("Nombre de la ciudad a buscar")) ?? "";
  if (!name) {
    await pause();
    return null;
  }

  let results: City[];
  try {
    results = await searchCity(name);
  } catch (err) {
    error(`\n${errorMessage(err)}\n`);
    await pause();
    return null;
  }

  if (results.length === 0) {
    warning("No se encontraron ciudades.\n");
    await pause();
    return null;
  }

  info("Resultados:");
  results.forEach((city, index) => {
    info(`  ${index + 1}. ${formatCity(city)}`);
  });

  const index = await pickFromList(`Elige un resultado (1-${results.length}) o Enter para cancelar`, results.length);
  if (index === null) {
    info("Operación cancelada.\n");
    await pause();
    return null;
  }

  const chosen = results[index];
  if (!chosen) return null;
  if (data.cities.some((c) => c.id === chosen.id)) {
    warning(`"${formatCity(chosen)}" ya está guardada.\n`);
    await pause();
    return null;
  }

  data.cities.push(chosen);
  await saveCities(data.cities);
  if (setAsDefault) {
    data.settings.defaultCityId = chosen.id;
    await saveSettings(data.settings);
  }

  success(`"${formatCity(chosen)}" agregada${setAsDefault ? " y establecida como default" : ""}.\n`);
  return chosen;
}