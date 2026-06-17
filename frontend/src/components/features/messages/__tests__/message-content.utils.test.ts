import {
  detectTextArtLineWidth,
  formatTextArtForDisplay,
  isBrailleArt,
  isTextArt,
  messagePreviewText,
  normalizeMessageContent,
  shouldCollapseMessage,
  shouldCollapseTextArt,
} from "../message-content.utils";

const SAMPLE_BRAILLE_ART = `⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⡞⠉⠀⠉⢳⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢷⣀⢀⣆⢀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⣠⠞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⡀⠀⠀⠀⠀⠀`;

const SAMPLE_ONE_LINE_ART = SAMPLE_BRAILLE_ART.replace(/\n/g, "");

describe("isTextArt", () => {
  it("detects braille unicode art", () => {
    expect(isTextArt(SAMPLE_BRAILLE_ART)).toBe(true);
    expect(isBrailleArt(SAMPLE_BRAILLE_ART)).toBe(true);
  });

  it("ignores short plain text", () => {
    expect(isTextArt("hello world")).toBe(false);
    expect(isTextArt("line one\nline two")).toBe(false);
  });

  it("collapses large text art but not small pieces", () => {
    expect(shouldCollapseTextArt(SAMPLE_BRAILLE_ART)).toBe(false);
    expect(shouldCollapseMessage(SAMPLE_BRAILLE_ART)).toBe(false);

    const bigArt = Array.from({ length: 15 }, () => SAMPLE_BRAILLE_ART).join(
      "\n",
    );
    expect(shouldCollapseTextArt(bigArt)).toBe(true);
    expect(shouldCollapseMessage(bigArt)).toBe(true);
    expect(shouldCollapseMessage("a".repeat(500))).toBe(true);
  });

  it("normalizes windows line endings", () => {
    expect(normalizeMessageContent("a\r\nb\rc")).toBe("a\nb\nc");
  });

  it("reflows single-line text art back into rows", () => {
    const width = detectTextArtLineWidth(SAMPLE_ONE_LINE_ART);
    expect(width).toBeGreaterThan(0);

    const reflowed = formatTextArtForDisplay(SAMPLE_ONE_LINE_ART);
    expect(reflowed.split("\n").length).toBeGreaterThan(3);
    expect(reflowed).toBe(SAMPLE_BRAILLE_ART);
  });

  it("uses a friendly preview label for quotes", () => {
    expect(messagePreviewText(SAMPLE_BRAILLE_ART)).toBe("Text art");
    expect(messagePreviewText("hello")).toBe("hello");
  });
});
