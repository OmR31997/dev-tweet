function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

describe("swipe-to-reply offsets", () => {
  it("clamps incoming swipes to the right", () => {
    expect(clamp(120, 0, 72)).toBe(72);
    expect(clamp(-10, 0, 72)).toBe(0);
  });

  it("clamps outgoing swipes to the left", () => {
    expect(clamp(-120, -72, 0)).toBe(-72);
    expect(clamp(10, -72, 0)).toBe(0);
  });
});
