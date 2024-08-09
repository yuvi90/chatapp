import { describe, expect, it } from "vitest";

function add(a: number, b: number): number {
  return a + b;
}

describe("test calculations", () => {
  it("should return 4 by adding 2+2", () => {
    const result = add(2, 2);
    expect(result).toEqual(4);
  });
});
