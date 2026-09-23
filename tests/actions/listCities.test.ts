import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { AppData, City } from "../../src/types/index.ts";

const infoMock = mock(() => {});

mock.module("../../src/presentation/output.ts", () => ({ info: infoMock }));

beforeEach(() => {
  mock.clearAllMocks();
  infoMock.mockReturnValue(undefined);
});

function makeData(): AppData {
  const first: City = { id: 1, name: "Madrid", latitude: 40.41, longitude: -3.7, country: "España", timezone: "Europe/Madrid" };
  const second: City = { id: 2, name: "Ottawa", latitude: 45.41, longitude: -75.69, country: "Canadá", admin1: "Ontario", timezone: "America/Toronto" };
  return { cities: [first, second], settings: { unit: "celsius", defaultCityId: second.id } };
}

describe("showCityList", () => {
  test("renders the header and numbered cities", async () => {
    const { showCityList } = await import("../../src/actions/listCities.ts");
    const data = makeData();

    showCityList(data);

    expect(infoMock).toHaveBeenNthCalledWith(1, "Ciudades guardadas:");
    expect(infoMock).toHaveBeenNthCalledWith(2, "  1. Madrid (España)");
    expect(infoMock).toHaveBeenNthCalledWith(3, "  2. Ottawa (Ontario, Canadá) (default)");
  });

  test("marks the default city", async () => {
    const { showCityList } = await import("../../src/actions/listCities.ts");

    showCityList(makeData());

    expect(infoMock).toHaveBeenCalledWith("  2. Ottawa (Ontario, Canadá) (default)");
  });
});