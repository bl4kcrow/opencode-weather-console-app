import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { AppData, City } from "../../src/types/index.ts";

const searchCityMock = mock(async () => [] as City[]);
const askMock = mock(async () => "");
const pauseMock = mock(async () => {});
const pickFromListMock = mock(async () => null as number | null);
const infoMock = mock(() => {});
const successMock = mock(() => {});
const warningMock = mock(() => {});
const errorMock = mock(() => {});
const errorMessageMock = mock((err: unknown) =>
  err instanceof Error ? err.message : String(err),
);
const saveCitiesMock = mock(async () => {});
const saveSettingsMock = mock(async () => {});

mock.module("../../src/api/geocoding.ts", () => ({ searchCity: searchCityMock }));
mock.module("../../src/presentation/input.ts", () => ({
  ask: askMock,
  pause: pauseMock,
  pickFromList: pickFromListMock,
}));
mock.module("../../src/presentation/output.ts", () => ({
  error: errorMock,
  errorMessage: errorMessageMock,
  info: infoMock,
  success: successMock,
  warning: warningMock,
}));
mock.module("../../src/storage/citiesStorage.ts", () => ({ saveCities: saveCitiesMock }));
mock.module("../../src/storage/settingsStorage.ts", () => ({ saveSettings: saveSettingsMock }));

beforeEach(() => {
  mock.clearAllMocks();
  askMock.mockResolvedValue("Ottawa");
  searchCityMock.mockResolvedValue([]);
  pauseMock.mockResolvedValue(undefined);
  pickFromListMock.mockResolvedValue(null);
  infoMock.mockReturnValue(undefined);
  successMock.mockReturnValue(undefined);
  warningMock.mockReturnValue(undefined);
  errorMock.mockReturnValue(undefined);
  errorMessageMock.mockReturnValue("error de geocoding");
  saveCitiesMock.mockResolvedValue(undefined);
  saveSettingsMock.mockResolvedValue(undefined);
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
  return { cities: [], settings: { unit: "celsius", defaultCityId: null } };
}

describe("addCity", () => {
  test("returns null and pauses on an empty name", async () => {
    const { addCity } = await import("../../src/actions/addCity.ts");
    askMock.mockResolvedValue("");

    expect(await addCity(makeData())).toBeNull();
    expect(pauseMock).toHaveBeenCalled();
    expect(searchCityMock).not.toHaveBeenCalled();
  });

  test("shows an error and returns null when the search fails", async () => {
    const { addCity } = await import("../../src/actions/addCity.ts");
    searchCityMock.mockRejectedValue(new Error("Error de geocoding (HTTP 500)"));
    errorMessageMock.mockImplementation((err: unknown) =>
      err instanceof Error ? err.message : String(err),
    );

    expect(await addCity(makeData())).toBeNull();
    expect(errorMock).toHaveBeenCalledWith(expect.stringContaining("HTTP 500"));
    expect(pauseMock).toHaveBeenCalled();
  });

  test("warns and returns null when no cities are found", async () => {
    const { addCity } = await import("../../src/actions/addCity.ts");

    expect(await addCity(makeData())).toBeNull();
    expect(warningMock).toHaveBeenCalledWith("No se encontraron ciudades.\n");
    expect(pauseMock).toHaveBeenCalled();
  });

  test("cancels when pickFromList returns null", async () => {
    const { addCity } = await import("../../src/actions/addCity.ts");
    searchCityMock.mockResolvedValue([ottawa()]);

    expect(await addCity(makeData())).toBeNull();
    expect(infoMock).toHaveBeenCalledWith("Operación cancelada.\n");
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });

  test("adds a city and persists the list", async () => {
    const { addCity } = await import("../../src/actions/addCity.ts");
    searchCityMock.mockResolvedValue([ottawa()]);
    pickFromListMock.mockResolvedValue(0);
    const data = makeData();

    const added = await addCity(data);

    expect(added).toEqual(ottawa());
    expect(data.cities).toContainEqual(ottawa());
    expect(saveCitiesMock).toHaveBeenCalledWith([ottawa()]);
    expect(successMock).toHaveBeenCalledWith(expect.stringContaining("agregada"));
    expect(saveSettingsMock).not.toHaveBeenCalled();
  });

  test("sets the default city when requested", async () => {
    const { addCity } = await import("../../src/actions/addCity.ts");
    searchCityMock.mockResolvedValue([ottawa()]);
    pickFromListMock.mockResolvedValue(0);
    const data = makeData();

    await addCity(data, true);

    expect(data.settings.defaultCityId).toBe(ottawa().id);
    expect(saveSettingsMock).toHaveBeenCalled();
  });

  test("rejects a duplicate city", async () => {
    const { addCity } = await import("../../src/actions/addCity.ts");
    searchCityMock.mockResolvedValue([ottawa()]);
    pickFromListMock.mockResolvedValue(0);
    const data = makeData();
    data.cities.push(ottawa());

    expect(await addCity(data)).toBeNull();
    expect(warningMock).toHaveBeenCalledWith(expect.stringContaining("ya está guardada"));
    expect(saveCitiesMock).not.toHaveBeenCalled();
  });
});