import { useEffect } from "react";
import { useCanonical } from "./useCanonical";

interface SEOOptions {
  title: string;
  description: string;
  path: string;
  jsonLd?: object | object[];
}

const DEFAULT_TITLE =
  "Lflauto | Professional Flute Lessons & Performances | Croydon, London";

export function useSEO({ title, description, path, jsonLd }: SEOOptions) {
  useCanonical(path);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDescription = meta?.content;
    if (meta) meta.content = description;

    const scripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      for (const block of blocks) {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-page-schema", "true");
        script.textContent = JSON.stringify(block);
        document.head.appendChild(script);
        scripts.push(script);
      }
    }

    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      if (meta && prevDescription !== undefined) meta.content = prevDescription;
      scripts.forEach((s) => s.remove());
    };
  }, [title, description, path, jsonLd]);
}
