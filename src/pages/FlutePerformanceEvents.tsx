import ServicePage from "@/components/ServicePage";

const areaServed = [
  { "@type": "City", name: "London" },
  { "@type": "City", name: "Croydon" },
  { "@type": "AdministrativeArea", name: "Surrey" },
  { "@type": "Country", name: "United Kingdom" },
];

const related = [
  { name: "Western Flute Lessons in London", path: "/western-flute-lessons-london" },
  { name: "Bansuri (Indian Flute) Lessons in Croydon", path: "/bansuri-lessons-croydon" },
];

const FlutePerformanceEvents = () => (
  <ServicePage
    slug="flute-performance-events"
    trackingName="Flute Performance Events"
    breadcrumbName="Flute Performance Events"
    serviceType="Live Music Performance"
    areaServed={areaServed}
    related={related}
  />
);

export default FlutePerformanceEvents;
