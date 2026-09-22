import { getCurrentTemp, getWeekForecast } from "../api/weather.ts";
import { error, errorMessage, info, warning } from "../presentation/output.ts";
import { pause } from "../presentation/input.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { formatCity, formatForecastDay } from "../utils/format.ts";
import { yellow } from "../utils/colors.ts";
import { addCity } from "./addCity.ts";
import type { AppData, City } from "../types/index.ts";

export async function showCityWeather(city: City, data: AppData): Promise<void> {
  try {
    const { temperature, unitLabel } = await getCurrentTemp(city, data.settings.unit);
    info(`\n${formatCity(city)}`);
    info(`  Temperatura actual: ${yellow(temperature)} ${unitLabel}\n`);
  } catch (err) {
    error(`\nError al consultar ${city.name}: ${errorMessage(err)}\n`);
  }
}

export async function showWeekWeather(city: City, data: AppData): Promise<void> {
  try {
    const { days, unitLabel } = await getWeekForecast(city, data.settings.unit);
    info(`\n${formatCity(city)} — próximo 7 días:`);
    for (const day of days) {
      info(formatForecastDay(day, unitLabel));
    }
    info("");
  } catch (err) {
    error(`\nError al consultar ${city.name}: ${errorMessage(err)}\n`);
  }
}

export async function showDefaultCityWeather(data: AppData): Promise<void> {
  if (data.settings.defaultCityId === null) {
    info("No hay ciudad default establecida.\n");
    const added = await addCity(data, true);
    if (added) {
      await showCityWeather(added, data);
      await pause();
    }
    return;
  }

  const city = data.cities.find((c) => c.id === data.settings.defaultCityId);
  if (!city) {
    warning("La ciudad default ya no existe; se restableció.\n");
    data.settings.defaultCityId = null;
    await saveSettings(data.settings);
    return;
  }

  await showCityWeather(city, data);
  await pause();
}

export async function showAllCitiesWeather(data: AppData): Promise<void> {
  if (data.cities.length === 0) {
    info("No hay ciudades guardadas.\n");
    await pause();
    return;
  }

  for (const city of data.cities) {
    await showCityWeather(city, data);
  }
  await pause();
}

export async function showWeekDefaultCityWeather(data: AppData): Promise<void> {
  if (data.settings.defaultCityId === null) {
    info("No hay ciudad default establecida.\n");
    const added = await addCity(data, true);
    if (added) {
      await showCityWeather(added, data);
      await pause();
    }
    return;
  }

  const city = data.cities.find((c) => c.id === data.settings.defaultCityId);
  if (!city) {
    warning("La ciudad default ya no existe; se restableció.\n");
    data.settings.defaultCityId = null;
    await saveSettings(data.settings);
    return;
  }

  await showWeekWeather(city, data);
  await pause();
}