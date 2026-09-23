import { useEffect } from "react";

const managedMeta = [
  ["name", "description"],
  ["name", "keywords"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:type"],
  ["property", "og:url"],
  ["name", "twitter:card"],
  ["name", "twitter:title"],
  ["name", "twitter:description"],
];

const setMeta = (attribute, name, content) => {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
  element.dataset.relfSeo = "true";
};

/**
 * A dependency-free SPA equivalent of a Helmet declaration.
 * It keeps document metadata accurate for this public route while allowing the
 * existing Vite app and payment flow to stay unchanged.
 */
const SeoHead = () => {
  useEffect(() => {
    const title = "Donate Relearn Foundation | Donate RELF";
    const description =
      "Donate Relearn Foundation (RELF) to help build more equitable learning opportunities. Donate RELF securely online and see how your contribution can make a difference.";
    const canonicalUrl = "https://donate.relf.in/";

    document.title = title;
    setMeta("name", "description", description);
    setMeta(
      "name",
      "keywords",
      "donate relearn foundation, donate relf, Relearn Foundation donation, RELF donation, support education India",
    );
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);
    canonical.dataset.relfSeo = "true";

    return () => {
      // The app has a single public brand; metadata intentionally remains when
      // navigating to a payment step so it is never reset to Vite defaults.
      managedMeta.forEach(([attribute, name]) => {
        const element = document.head.querySelector(`meta[${attribute}="${name}"][data-relf-seo="true"]`);
        element?.removeAttribute("data-relf-seo");
      });
    };
  }, []);

  return null;
};

export default SeoHead;
