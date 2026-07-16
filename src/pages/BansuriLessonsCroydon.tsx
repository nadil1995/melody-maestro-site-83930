import ServicePage from "@/components/ServicePage";

const areaServed = [
  { "@type": "City", name: "Croydon" },
  { "@type": "City", name: "London" },
  { "@type": "AdministrativeArea", name: "Surrey" },
];

const availableChannel = [
  { "@type": "ServiceChannel", name: "In-person lessons" },
  { "@type": "ServiceChannel", name: "Online lessons" },
];

const related = [
  { name: "Western Flute Lessons in London", path: "/western-flute-lessons-london" },
  { name: "Flute Performances for Events", path: "/flute-performance-events" },
];

const BansuriLessonsCroydon = () => (
  <ServicePage
    slug="bansuri-lessons-croydon"
    trackingName="Bansuri Lessons Croydon"
    breadcrumbName="Bansuri Lessons Croydon"
    serviceType="Bansuri Lessons"
    areaServed={areaServed}
    availableChannel={availableChannel}
    related={related}
  />
);

export default BansuriLessonsCroydon;
