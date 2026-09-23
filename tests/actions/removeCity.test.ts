import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { AppData, City } from "../../src/types/index.ts";

const pauseMock = mock(async () => {});
const pickFromListMock = mock(async () => null as number | null);
const infoMock = mock(() => {});
const successMock = mock(() => {});
const saveCitiesMock = mock(async () => {});
const saveSettingsMock = mock(async () => {});
const showCityListMock = mock(() => {});

mock.module("../../src/presentation/input.ts", () => ({
  pause: pauseMock,
  pickFromList: pickFromListMock,
}));
mock.module("../../src/presentation/output.ts", () => ({
  info: infoMock,
  success: successMock,
}));
mock.module("../../src/storage/citiesStorage.ts", () => ({ saveCities: saveCitiesMock }));
mock.module("../../src/storage/settingsStorage.ts", () => ({ saveSettings: saveSettingsMock }));
mock.module("../../src/actions/listCities.ts", () => ({ showCityList: showCityListMock }));

beforeEach(() => {
  mock.clearAllMocks();
  pauseMock.mockResolvedValue(undefined);
  pickFromListMock.mockResolvedValue(null);
  infoMock.mockReturnValue(undefined);
  successMock.mockReturnValue(undefined);
  saveCitiesMock.mockResolvedValue(undefined);
  saveSettingsMock.mockResolvedValue(undefined);
});

function cities(): City[] {
  return [
    { id: 1, name: "Madrid", latitude: 40.41, longitude: -3.7, country: "España", timezone: "Europe/Madrid" },
    { id: 2, name: "Ottawa", latitude: 45.41, longitude: -75.69, country: "Canadá", admin1: "Ontario", timezone: "America/Toronto" },
  ];
}

function makeData(): AppData {
  return { cities: cities(), settings: { unit: "celsius", defaultCityId: 2 } };
}

describe("removeCity", () => {
  test("informs and returns when there are no cities", async () => {
    const { removeCity } = await import("../../src/actions/removeCity.ts");
    const data = makeData();
    data.cities = [];

    await removeCity(data);

    expect(infoMock).toHaveBeenCalledWith("No hay ciudades guardadas.\n");
    expect(pickFromListMock).not.toHaveBeenCalled();
  });

  test("cancels without persisting when pickFromList returns null", async () => {
    const { removeCity } = await import("../../src/actions/removeCity.ts");
    const data = makeData();

    await removeCity(data);

    expect(infoMock).toHaveBeenCalledWith("Operación cancelada.\n");
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("removes the chosen city and cleans up the default", async () => {
    const { removeCity } = await import("../../src/actions/removeCity.ts");
    pickFromListMock.mockResolvedValue(1);
    const data = makeData();

    await removeCity(data);

    expect(data.cities).toEqual([cities()[0]!]);
    expect(data.settings.defaultCityId).toBeNull();
    expect(saveCitiesMock).toHaveBeenCalledWith([cities()[0]!]);
    expect(saveSettingsMock).toHaveBeenCalled();
    expect(successMock).toHaveBeenCalledWith(expect.stringContaining("eliminada"));
  });

  test("removes a non-default city without touching settings", async () => {
    const { removeCity } = await import("../../src/actions/removeCity.ts");
    pickFromListMock.mockResolvedValue(0);
    const data = makeData();

    await removeCity(data);

    expect(data.cities).toEqual([cities()[1]!]);
    expect(data.settings.defaultCityId).toBe(2);
    expect(saveSettingsMock).toHaveBeenCalledWith(data.settings);
  });
});