import { useEffect } from "react";

const BASE = "https://www.lflauto.co.uk";

export function useCanonical(path: string) {
  useEffect(() => {
    const href = path === "/" ? `${BASE}/` : `${BASE}${path}`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [path]);
}
