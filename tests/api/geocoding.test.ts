import { afterEach, describe, expect, mock, test } from "bun:test";
import { searchCity } from "../../src/api/geocoding.ts";
import type { City } from "../../src/types/index.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(status: number, body: unknown): ReturnType<typeof mock> {
  const fn = mock(async () => new Response(JSON.stringify(body), { status }));
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe("searchCity", () => {
  test("builds the geocoding URL and maps results to City", async () => {
    const fn = mockFetch(200, {
      results: [
        {
          id: 6094817,
          name: "Ottawa",
          latitude: 45.41117,
          longitude: -75.69812,
          country: "Canadá",
          admin1: "Ontario",
          timezone: "America/Toronto",
        },
      ],
    });

    const cities = await searchCity("  Ottawa ");

    const [input] = fn.mock.calls[0] as [URL];
    expect(input instanceof URL).toBe(true);
    const url = new URL(String(input));
    expect(url.origin).toBe("https://geocoding-api.open-meteo.com");
    expect(url.pathname).toBe("/v1/search");
    expect(url.searchParams.get("name")).toBe("Ottawa");
    expect(url.searchParams.get("count")).toBe("5");
    expect(url.searchParams.get("language")).toBe("es");
    expect(url.searchParams.get("format")).toBe("json");

    expect(cities).toEqual<City[]>([
      {
        id: 6094817,
        name: "Ottawa",
        latitude: 45.41117,
        longitude: -75.69812,
        country: "Canadá",
        admin1: "Ontario",
        timezone: "America/Toronto",
      },
    ]);
  });

  test("defaults missing optional fields", async () => {
    mockFetch(200, {
      results: [{ id: 1, name: "X", latitude: 0, longitude: 0, timezone: "" }],
    });

    const cities = await searchCity("X");
    expect(cities[0]).toMatchObject({
      id: 1,
      name: "X",
      latitude: 0,
      longitude: 0,
      country: "",
      timezone: "",
    });
    expect(cities[0]?.admin1).toBeUndefined();
  });

  test("filters out results without numeric coordinates", async () => {
    mockFetch(200, {
      results: [
        { id: 1, name: "A", latitude: "x", longitude: 5 },
        { id: 2, name: "B", latitude: 5, longitude: null },
        { id: 3, name: "C", latitude: 10, longitude: 20 },
      ],
    });

    const cities = await searchCity("A");
    expect(cities).toHaveLength(1);
    expect(cities[0]?.id).toBe(3);
  });

  test("returns an empty list when there are no results", async () => {
    mockFetch(200, {});
    expect(await searchCity("Nope")).toEqual([]);
  });

  test("throws on a non-2xx response", async () => {
    mockFetch(500, {});
    expect(searchCity("Ottawa")).rejects.toThrow("Error de geocoding (HTTP 500)");
  });
});