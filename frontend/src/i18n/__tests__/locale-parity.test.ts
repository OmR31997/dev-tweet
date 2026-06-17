import en from "../../../messages/en.json";
import hi from "../../../messages/hi.json";

type JsonValue = string | JsonValue[] | { [key: string]: JsonValue };

function collectKeys(value: JsonValue, prefix = ""): string[] {
  if (typeof value === "string") return prefix ? [prefix] : [];
  if (Array.isArray(value)) return prefix ? [prefix] : [];

  const keys: string[] = [];
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") {
      keys.push(path);
    } else {
      keys.push(...collectKeys(child, path));
    }
  }
  return keys.sort();
}

describe("locale message parity", () => {
  it("has the same keys in en and hi", () => {
    const enKeys = collectKeys(en as JsonValue);
    const hiKeys = collectKeys(hi as JsonValue);

    const missingInHi = enKeys.filter((key) => !hiKeys.includes(key));
    const missingInEn = hiKeys.filter((key) => !enKeys.includes(key));

    expect(missingInHi).toEqual([]);
    expect(missingInEn).toEqual([]);
  });
});
