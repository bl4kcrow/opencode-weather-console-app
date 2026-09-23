import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { AppData, City } from "../../src/types/index.ts";

const pauseMock = mock(async () => {});
const pickFromListMock = mock(async () => null as number | null);
const infoMock = mock(() => {});
const successMock = mock(() => {});
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
mock.module("../../src/storage/settingsStorage.ts", () => ({ saveSettings: saveSettingsMock }));
mock.module("../../src/actions/listCities.ts", () => ({ showCityList: showCityListMock }));

beforeEach(() => {
  mock.clearAllMocks();
  pauseMock.mockResolvedValue(undefined);
  pickFromListMock.mockResolvedValue(null);
  infoMock.mockReturnValue(undefined);
  successMock.mockReturnValue(undefined);
  saveSettingsMock.mockResolvedValue(undefined);
});

function city(): City {
  return { id: 6094817, name: "Ottawa", latitude: 45.41, longitude: -75.69, country: "Canadá", admin1: "Ontario", timezone: "America/Toronto" };
}

function makeData(): AppData {
  return { cities: [city()], settings: { unit: "celsius", defaultCityId: null } };
}

describe("setDefaultCity", () => {
  test("informs and returns when there are no cities", async () => {
    const { setDefaultCity } = await import("../../src/actions/setDefaultCity.ts");
    const data = makeData();
    data.cities = [];

    await setDefaultCity(data);

    expect(infoMock).toHaveBeenCalledWith("No hay ciudades guardadas; agrega una primero.\n");
    expect(pickFromListMock).not.toHaveBeenCalled();
  });

  test("cancels without persisting when pickFromList returns null", async () => {
    const { setDefaultCity } = await import("../../src/actions/setDefaultCity.ts");

    await setDefaultCity(makeData());

    expect(infoMock).toHaveBeenCalledWith("Operación cancelada.\n");
    expect(saveSettingsMock).not.toHaveBeenCalled();
  });

  test("sets the default city and persists the settings", async () => {
    const { setDefaultCity } = await import("../../src/actions/setDefaultCity.ts");
    pickFromListMock.mockResolvedValue(0);
    const data = makeData();

    await setDefaultCity(data);

    expect(data.settings.defaultCityId).toBe(city().id);
    expect(saveSettingsMock).toHaveBeenCalledWith(data.settings);
    expect(successMock).toHaveBeenCalledWith(expect.stringContaining("Ciudad default"));
  });
});