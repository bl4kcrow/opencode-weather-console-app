import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { AppData, City, DailyForecast } from "../../src/types/index.ts";

const getCurrentTempMock = mock(async () => ({ temperature: 21.5, unitLabel: "°C" }));
const getWeekForecastMock = mock(async () => ({ days: [] as DailyForecast[], unitLabel: "°C" }));
const pauseMock = mock(async () => {});
const infoMock = mock(() => {});
const errorMock = mock(() => {});
const errorMessageMock = mock((err: unknown) => (err instanceof Error ? err.message : String(err)));
const warningMock = mock(() => {});
const saveSettingsMock = mock(async () => {});
const addCityMock = mock(async () => null as City | null);

mock.module("../../src/api/weather.ts", () => ({
  getCurrentTemp: getCurrentTempMock,
  getWeekForecast: getWeekForecastMock,
}));
mock.module("../../src/presentation/output.ts", () => ({
  error: errorMock,
  errorMessage: errorMessageMock,
  info: infoMock,
  warning: warningMock,
}));
mock.module("../../src/presentation/input.ts", () => ({ pause: pauseMock }));
mock.module("../../src/storage/settingsStorage.ts", () => ({ saveSettings: saveSettingsMock }));
mock.module("../../src/actions/addCity.ts", () => ({ addCity: addCityMock }));

beforeEach(() => {
  mock.clearAllMocks();
  getCurrentTempMock.mockResolvedValue({ temperature: 21.5, unitLabel: "°C" });
  getWeekForecastMock.mockResolvedValue({ days: [] as DailyForecast[], unitLabel: "°C" });
  pauseMock.mockResolvedValue(undefined);
  infoMock.mockReturnValue(undefined);
  errorMock.mockReturnValue(undefined);
  errorMessageMock.mockReturnValue("algo salió mal");
  warningMock.mockReturnValue(undefined);
  saveSettingsMock.mockResolvedValue(undefined);
  addCityMock.mockResolvedValue(null);
});

function ottawa(): City {
  return {
    id: 6094817,
    name: "Ottawa",
    latitude: 45.41117,
    longitude: -75.69812,
    country: "Canadá",
    admin1: "Ontario",
    timezone: "America/Toronto",
  };
}

function makeData(): AppData {
  return { cities: [ottawa()], settings: { unit: "celsius", defaultCityId: ottawa().id } };
}

describe("showCityWeather", () => {
  test("prints the city and current temperature", async () => {
    const { showCityWeather } = await import("../../src/actions/getWeather.ts");

    await showCityWeather(ottawa(), makeData());

    expect(getCurrentTempMock).toHaveBeenCalledWith(ottawa(), "celsius");
    expect(infoMock).toHaveBeenCalledWith(expect.stringContaining("Ottawa (Ontario, Canadá)"));
    expect(infoMock).toHaveBeenCalledWith(expect.stringContaining("21.5 °C"));
    expect(errorMock).not.toHaveBeenCalled();
  });

  test("reports API errors", async () => {
    const { showCityWeather } = await import("../../src/actions/getWeather.ts");
    getCurrentTempMock.mockRejectedValue(new Error("Error de clima (HTTP 503)"));
    errorMessageMock.mockImplementation((err: unknown) =>
      err instanceof Error ? err.message : String(err),
    );

    await showCityWeather(ottawa(), makeData());

    expect(errorMock).toHaveBeenCalledWith(expect.stringContaining("HTTP 503"));
  });
});

describe("showWeekWeather", () => {
  test("prints the header and each forecast day", async () => {
    const { showWeekWeather } = await import("../../src/actions/getWeather.ts");
    const days: DailyForecast[] = [
      { date: "2026-09-23", tempMax: 20.5, tempMin: 12, weatherCode: 61 },
    ];
    getWeekForecastMock.mockResolvedValue({ days, unitLabel: "°C" });

    await showWeekWeather(ottawa(), makeData());

    expect(getWeekForecastMock).toHaveBeenCalledWith(ottawa(), "celsius");
    expect(infoMock).toHaveBeenCalledWith(expect.stringContaining("próximo 7 días"));
    expect(infoMock).toHaveBeenCalledWith(expect.stringContaining("max 20.5°C / min 12°C"));
    expect(infoMock).toHaveBeenCalledWith(expect.stringContaining("Lluvia"));
  });
});

describe("showDefaultCityWeather", () => {
  test("offers to add a city when there is no default", async () => {
    const { showDefaultCityWeather } = await import("../../src/actions/getWeather.ts");
    const data = makeData();
    data.settings.defaultCityId = null;

    await showDefaultCityWeather(data);

    expect(infoMock).toHaveBeenCalledWith("No hay ciudad default establecida.\n");
    expect(addCityMock).toHaveBeenCalledWith(data, true);
  });

  test("shows the added city after setting a new default", async () => {
    const { showDefaultCityWeather } = await import("../../src/actions/getWeather.ts");
    const data = makeData();
    data.settings.defaultCityId = null;
    addCityMock.mockResolvedValue(ottawa());

    await showDefaultCityWeather(data);

    expect(getCurrentTempMock).toHaveBeenCalled();
    expect(pauseMock).toHaveBeenCalled();
  });

  test("resets a dangling default city id", async () => {
    const { showDefaultCityWeather } = await import("../../src/actions/getWeather.ts");
    const data = makeData();
    data.settings.defaultCityId = 999999;

    await showDefaultCityWeather(data);

    expect(warningMock).toHaveBeenCalledWith(
      expect.stringContaining("ya no existe; se restableció"),
    );
    expect(data.settings.defaultCityId).toBeNull();
    expect(saveSettingsMock).toHaveBeenCalledWith(data.settings);
    expect(getCurrentTempMock).not.toHaveBeenCalled();
  });

  test("prints the weather for the default city", async () => {
    const { showDefaultCityWeather } = await import("../../src/actions/getWeather.ts");

    await showDefaultCityWeather(makeData());

    expect(getCurrentTempMock).toHaveBeenCalledWith(ottawa(), "celsius");
    expect(pauseMock).toHaveBeenCalled();
  });
});

describe("showAllCitiesWeather", () => {
  test("informs when there are no cities", async () => {
    const { showAllCitiesWeather } = await import("../../src/actions/getWeather.ts");
    const data = makeData();
    data.cities = [];

    await showAllCitiesWeather(data);

    expect(infoMock).toHaveBeenCalledWith("No hay ciudades guardadas.\n");
    expect(pauseMock).toHaveBeenCalled();
    expect(getCurrentTempMock).not.toHaveBeenCalled();
  });

  test("fetches weather for every city", async () => {
    const { showAllCitiesWeather } = await import("../../src/actions/getWeather.ts");
    const data = makeData();
    data.cities.push({ id: 3, name: "Madrid", latitude: 40.41, longitude: -3.7, country: "España", timezone: "Europe/Madrid" });

    await showAllCitiesWeather(data);

    expect(getCurrentTempMock).toHaveBeenCalledTimes(2);
    expect(pauseMock).toHaveBeenCalled();
  });
});

describe("showWeekDefaultCityWeather", () => {
  test("shows the weekly forecast for the default city", async () => {
    const { showWeekDefaultCityWeather } = await import("../../src/actions/getWeather.ts");
    getWeekForecastMock.mockResolvedValue({
      days: [{ date: "2026-09-23", tempMax: 20, tempMin: 10, weatherCode: 0 }],
      unitLabel: "°C",
    });

    await showWeekDefaultCityWeather(makeData());

    expect(getWeekForecastMock).toHaveBeenCalledWith(ottawa(), "celsius");
    expect(pauseMock).toHaveBeenCalled();
  });

  test("offers to add a city when there is no default", async () => {
    const { showWeekDefaultCityWeather } = await import("../../src/actions/getWeather.ts");
    const data = makeData();
    data.settings.defaultCityId = null;

    await showWeekDefaultCityWeather(data);

    expect(addCityMock).toHaveBeenCalledWith(data, true);
  });
});