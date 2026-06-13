import { defaultLocale, isLocale, locales, LOCALE_COOKIE } from "@/i18n/config";

describe("i18n config", () => {
  it("defines supported locales", () => {
    expect(locales).toEqual(["en", "hi"]);
    expect(defaultLocale).toBe("en");
  });

  it("exposes locale cookie name", () => {
    expect(LOCALE_COOKIE).toBe("NEXT_LOCALE");
  });

  it("validates locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("hi")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });
});
