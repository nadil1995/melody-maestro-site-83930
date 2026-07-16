import { useMemo } from "react";
import ServicePageLayout from "@/components/ServicePageLayout";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useSEO } from "@/hooks/useSEO";
import {
  useServicePageContent,
  type ServicePageSlug,
} from "@/lib/servicePageStorage";

const BASE = "https://www.lflauto.co.uk";

export interface ServicePageConfig {
  slug: ServicePageSlug;
  trackingName: string;
  breadcrumbName: string;
  serviceType: string;
  areaServed: object[];
  availableChannel?: object[];
  related: { name: string; path: string }[];
}

const ServicePage = ({
  slug,
  trackingName,
  breadcrumbName,
  serviceType,
  areaServed,
  availableChannel,
  related,
}: ServicePageConfig) => {
  usePageTracking(trackingName);
  const content = useServicePageContent(slug);
  const path = `/${slug}`;
  const url = `${BASE}${path}`;

  const jsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${url}#service`,
        name: content.heading,
        serviceType,
        description: content.metaDescription,
        url,
        provider: { "@id": `${BASE}/#music-school` },
        areaServed,
        ...(availableChannel ? { availableChannel } : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
          { "@type": "ListItem", position: 2, name: breadcrumbName, item: url },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: content.faqs.filter((f) => f.question.trim()).map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
    [content, url, serviceType, breadcrumbName, areaServed, availableChannel]
  );

  useSEO({
    title: content.metaTitle,
    description: content.metaDescription,
    path,
    jsonLd,
  });

  return (
    <ServicePageLayout
      heading={content.heading}
      subheading={content.subheading}
      intro={content.intro}
      featureGroups={content.featureGroups}
      areas={content.areas}
      faqs={content.faqs}
      ctaText={content.ctaText}
      related={related}
    />
  );
};

export default ServicePage;
