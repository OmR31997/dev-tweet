import { createPageMetadata } from "@/lib/seo/metadata";

describe("createPageMetadata", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://devtweethub.web.app";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  it("sets canonical and absolute OG image URLs when path is provided", () => {
    const metadata = createPageMetadata({
      title: "Sign in",
      path: "/login",
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://devtweethub.web.app/login",
    );
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: "https://devtweethub.web.app/opengraph-image",
      }),
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://devtweethub.web.app/opengraph-image",
    ]);
  });

  it("omits canonical when path is omitted", () => {
    const metadata = createPageMetadata({ title: "Messages" });
    expect(metadata.alternates?.canonical).toBeUndefined();
    expect(metadata.openGraph?.url).toBeUndefined();
  });
});
