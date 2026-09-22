import { getCurrentTemp, searchCity } from "./src/api.ts";
import { green, red, yellow } from "./src/colors.ts";
import { loadData, saveData } from "./src/storage.ts";
import { formatCity, renderMenu, toggleUnit, unitSymbol } from "./src/ui.ts";
import type { AppData, City } from "./src/types.ts";

async function main(): Promise<void> {
  const data = await loadData();
  let running = true;

  while (running) {
    console.log(renderMenu(data.cities.length, unitSymbol(data.settings.unit)));
    const choice = await ask("Selecciona una opción");

    switch (choice) {
      case "1":
        await showDefault(data);
        break;
      case "2":
        await showAll(data);
        break;
      case "3":
        await addCity(data);
        break;
      case "4":
        await removeCity(data);
        break;
      case "5":
        await setDefault(data);
        break;
      case "8":
        data.settings.unit = toggleUnit(data.settings.unit);
        await saveData(data);
        console.log(green(`Unidad configurada: ${unitSymbol(data.settings.unit)}\n`));
        await pause();
        break;
      case "9":
        running = false;
        break;
      default:
        if (choice && choice !== "") console.log(red("Opción no válida.\n"));
    }
  }

  console.log("¡Hasta pronto!");
}

async function showDefault(data: AppData): Promise<void> {
  if (data.settings.defaultCityId === null) {
    console.log("No hay ciudad default establecida.\n");
    await addCity(data, true);
    return;
  }

  const city = data.cities.find((c) => c.id === data.settings.defaultCityId);
  if (!city) {
    console.log(yellow("La ciudad default ya no existe; se restableció.\n"));
    data.settings.defaultCityId = null;
    await saveData(data);
    return;
  }

  await showWeather(city, data);
  await pause();
}

async function showAll(data: AppData): Promise<void> {
  if (data.cities.length === 0) {
    console.log("No hay ciudades guardadas.\n");
    await pause();
    return;
  }

  for (const city of data.cities) {
    await showWeather(city, data);
  }
  await pause();
}

async function showWeather(city: City, data: AppData): Promise<void> {
  try {
    const { temperature, unitLabel } = await getCurrentTemp(city, data.settings.unit);
    console.log(`\n${formatCity(city)}`);
    console.log(`  Temperatura actual: ${yellow(temperature)} ${unitLabel}\n`);
  } catch (error) {
    console.log(red(`\nError al consultar ${city.name}: ${errorMessage(error)}\n`));
  }
}

async function addCity(data: AppData, setAsDefault = false): Promise<void> {
  const name = (await ask("Nombre de la ciudad a buscar")) ?? "";
  if (!name) {
    await pause();
    return;
  }

  let results: City[];
  try {
    results = await searchCity(name);
  } catch (error) {
    console.log(red(`\n${errorMessage(error)}\n`));
    await pause();
    return;
  }

  if (results.length === 0) {
    console.log(yellow("No se encontraron ciudades.\n"));
    await pause();
    return;
  }

  console.log("Resultados:");
  results.forEach((city, index) => {
    console.log(`  ${index + 1}. ${formatCity(city)}`);
  });

  const index = await pickFromList(`Elige un resultado (1-${results.length}) o Enter para cancelar`, results.length);
  if (index === null) {
    console.log("Operación cancelada.\n");
    await pause();
    return;
  }

  const chosen = results[index];
  if (!chosen) return;
  if (data.cities.some((c) => c.id === chosen.id)) {
    console.log(yellow(`"${formatCity(chosen)}" ya está guardada.\n`));
    await pause();
    return;
  }

  data.cities.push(chosen);
  if (setAsDefault) data.settings.defaultCityId = chosen.id;
  await saveData(data);

  console.log(
    green(`"${formatCity(chosen)}" agregada${setAsDefault ? " y establecida como default" : ""}.\n`),
  );
  if (setAsDefault) await showWeather(chosen, data);
  await pause();
}

async function removeCity(data: AppData): Promise<void> {
  if (data.cities.length === 0) {
    console.log("No hay ciudades guardadas.\n");
    await pause();
    return;
  }

  showCityList(data);
  const index = await pickFromList(
    `Elige una ciudad (1-${data.cities.length}) o Enter para cancelar`,
    data.cities.length,
  );
  if (index === null) {
    console.log("Operación cancelada.\n");
    await pause();
    return;
  }

  const city = data.cities[index]!;
  if (data.settings.defaultCityId === city.id) data.settings.defaultCityId = null;
  data.cities.splice(index, 1);
  await saveData(data);
  console.log(green(`"${formatCity(city)}" eliminada.\n`));
  await pause();
}

async function setDefault(data: AppData): Promise<void> {
  if (data.cities.length === 0) {
    console.log("No hay ciudades guardadas; agrega una primero.\n");
    await pause();
    return;
  }

  showCityList(data);
  const index = await pickFromList(
    `Elige una ciudad (1-${data.cities.length}) o Enter para cancelar`,
    data.cities.length,
  );
  if (index === null) {
    console.log("Operación cancelada.\n");
    await pause();
    return;
  }

  const city = data.cities[index]!;
  data.settings.defaultCityId = city.id;
  await saveData(data);
  console.log(green(`Ciudad default: ${formatCity(city)}\n`));
  await pause();
}

function showCityList(data: AppData): void {
  console.log("Ciudades guardadas:");
  data.cities.forEach((city, index) => {
    const isDefault = data.settings.defaultCityId === city.id ? " (default)" : "";
    console.log(`  ${index + 1}. ${formatCity(city)}${isDefault}`);
  });
}

async function pickFromList(question: string, max: number): Promise<number | null> {
  const raw = (await ask(question)) ?? "";
  if (raw === "") return null;

  const value = Number(raw);
  const index = value - 1;
  if (!Number.isInteger(value) || index < 0 || index >= max) return null;
  return index;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function ask(question: string): Promise<string | null> {
  const answer = prompt(question);
  if (answer === null) return Promise.resolve(null);
  return Promise.resolve(answer.trim());
}

function pause(): Promise<void> {
  return ask("Presiona Enter para continuar...").then(() => {});
}

await main();