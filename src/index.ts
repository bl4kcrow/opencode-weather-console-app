import { addCity } from "./actions/addCity.ts";
import {
  showAllCitiesWeather,
  showDefaultCityWeather,
  showWeekDefaultCityWeather,
} from "./actions/getWeather.ts";
import { removeCity } from "./actions/removeCity.ts";
import { setDefaultCity } from "./actions/setDefaultCity.ts";
import { pause } from "./presentation/input.ts";
import { renderMenu, selectOption } from "./presentation/menu.ts";
import { success } from "./presentation/output.ts";
import { loadCities } from "./storage/citiesStorage.ts";
import { loadSettings, saveSettings, toggleUnit } from "./storage/settingsStorage.ts";
import { unitSymbol } from "./utils/format.ts";
import type { AppData, MenuOption } from "./types/index.ts";

async function main(): Promise<void> {
  const data: AppData = {
    cities: await loadCities(),
    settings: await loadSettings(),
  };
  let running = true;

  const buildOptions = (): MenuOption[] => [
    { key: "1", label: "Clima de ciudad default", run: () => showDefaultCityWeather(data) },
    {
      key: "2",
      label: `Clima de todas las ciudades (${data.cities.length})`,
      run: () => showAllCitiesWeather(data),
    },
    {
      key: "3",
      label: "Buscar y agregar ciudad",
      run: async () => {
        const added = await addCity(data);
        if (added) await pause();
      },
    },
    { key: "4", label: "Eliminar ciudad", run: () => removeCity(data) },
    { key: "5", label: "Establecer ciudad default", run: () => setDefaultCity(data) },
    { key: "6", label: "Pronóstico 7 días (default)", run: () => showWeekDefaultCityWeather(data) },
    {
      key: "8",
      label: `Ajustes (${unitSymbol(data.settings.unit)})`,
      run: async () => {
        data.settings.unit = toggleUnit(data.settings.unit);
        await saveSettings(data.settings);
        success(`Unidad configurada: ${unitSymbol(data.settings.unit)}\n`);
        await pause();
      },
    },
    {
      key: "9",
      label: "Salir",
      run: () => {
        running = false;
      },
    },
  ];

  while (running) {
    const options = buildOptions();
    console.log(renderMenu(options));
    const selected = await selectOption(options);
    if (selected) await selected.run();
  }

  console.log("¡Hasta pronto!");
}

await main();