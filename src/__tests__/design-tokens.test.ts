import { colors, colorFamilies, shades } from "@/lib/design-tokens";

const EXPECTED_FAMILIES = [
  "ruby-red",
  "snow",
  "pale-slate",
  "air-force-blue",
  "sky-blue",
] as const;

const EXPECTED_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

describe("design-tokens color palette", () => {
  it("exports all five color families", () => {
    expect(colorFamilies).toEqual(expect.arrayContaining(EXPECTED_FAMILIES));
    expect(colorFamilies).toHaveLength(EXPECTED_FAMILIES.length);
  });

  it.each(EXPECTED_FAMILIES)(
    "%s has all required shades",
    (family) => {
      const familyColors = colors[family];
      const exportedShades = Object.keys(familyColors).map(Number);
      expect(exportedShades).toEqual(expect.arrayContaining(EXPECTED_SHADES));
      expect(exportedShades).toHaveLength(EXPECTED_SHADES.length);
    }
  );

  it.each(EXPECTED_FAMILIES)(
    "%s shades are valid hex colors",
    (family) => {
      const familyColors = colors[family];
      for (const shade of shades) {
        const value = familyColors[shade];
        expect(value).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  );
});
