import ServicePage from "@/components/ServicePage";

const areaServed = [
  { "@type": "City", name: "London" },
  { "@type": "City", name: "Croydon" },
  { "@type": "AdministrativeArea", name: "Surrey" },
];

const availableChannel = [
  { "@type": "ServiceChannel", name: "In-person lessons" },
  { "@type": "ServiceChannel", name: "Online lessons" },
];

const related = [
  { name: "Bansuri (Indian Flute) Lessons in Croydon", path: "/bansuri-lessons-croydon" },
  { name: "Flute Performances for Events", path: "/flute-performance-events" },
];

const WesternFluteLessonsLondon = () => (
  <ServicePage
    slug="western-flute-lessons-london"
    trackingName="Western Flute Lessons London"
    breadcrumbName="Western Flute Lessons London"
    serviceType="Flute Lessons"
    areaServed={areaServed}
    availableChannel={availableChannel}
    related={related}
  />
);

export default WesternFluteLessonsLondon;
