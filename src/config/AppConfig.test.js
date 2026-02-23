import { describe, it, expect } from "vitest";
import { lightenColor } from "./AppConfig.js";

describe("lightenColor", () => {
  it("should correctly lighten a given hex color", () => {
    const coral = "#FF7F50";
    // Lighten by 15% -> ~38 points
    // R: 255 -> 255
    // G: 127 + 38 = 165 -> a5
    // B: 80 + 38 = 118 -> 76
    const expected = "#ffa576";
    expect(lightenColor(coral, 15)).toBe(expected);
  });

  it("should cap the color values at #ffffff (white)", () => {
    const lightGray = "#eeeeee";
    const expected = "#ffffff";
    // Lightening by 50% should definitely result in pure white
    expect(lightenColor(lightGray, 50)).toBe(expected);
  });

  it("should handle pure black", () => {
    const black = "#000000";
    // Lighten by 20% -> ~51 points
    // R, G, B: 0 + 51 = 51 -> 33
    const expected = "#333333";
    expect(lightenColor(black, 20)).toBe(expected);
  });

  it("should return the same color if percentage is 0", () => {
    const blue = "#0000ff";
    expect(lightenColor(blue, 0)).toBe("#0000ff");
  });
});
