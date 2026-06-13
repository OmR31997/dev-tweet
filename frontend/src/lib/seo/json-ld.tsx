import { getSiteUrl, site } from "@/config/site";

export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${getSiteUrl()}/#website`,
        name: site.name,
        alternateName: ["DevTweet Hub", "DevTweetHub"],
        description: site.description,
        url: getSiteUrl(),
        inLanguage: "en",
      },
      {
        "@type": "WebApplication",
        "@id": `${getSiteUrl()}/#app`,
        name: site.name,
        description: site.description,
        url: getSiteUrl(),
        applicationCategory: "SocialNetworkingApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript. Requires HTML5.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
