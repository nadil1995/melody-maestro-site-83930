import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useEffect, useState } from "react";

const BUCKET = import.meta.env.VITE_S3_BUCKET || "geoapp-build-artifacts";
const REGION = import.meta.env.VITE_S3_REGION || "eu-west-2";
const S3_BASE = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;
const S3_KEY = "data/service-pages.json";

export interface FeatureGroup {
  title: string;
  items: string[];
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServicePageContent {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  subheading: string;
  intro: string[];
  featureGroups: FeatureGroup[];
  areas: string;
  faqs: ServiceFAQ[];
  ctaText: string;
}

export type ServicePageSlug =
  | "western-flute-lessons-london"
  | "bansuri-lessons-croydon"
  | "flute-performance-events";

export type ServicePagesData = Record<ServicePageSlug, ServicePageContent>;

export const SERVICE_PAGE_NAMES: Record<ServicePageSlug, string> = {
  "western-flute-lessons-london": "Western Flute Lessons London",
  "bansuri-lessons-croydon": "Bansuri Lessons Croydon",
  "flute-performance-events": "Flute Performance Events",
};

export const DEFAULT_SERVICE_PAGES: ServicePagesData = {
  "western-flute-lessons-london": {
    metaTitle: "Western Flute Lessons London | LTCL Qualified Teacher | Lflauto",
    metaDescription:
      "Western classical flute lessons in London, Croydon & Surrey with LTCL-qualified flautist Lashikala Hettiarachchi. Beginners welcome. ABRSM & Trinity exam preparation. In-person and online.",
    heading: "Western Flute Lessons in London",
    subheading:
      "Classical flute tuition for all ages and levels, taught by an LTCL-qualified professional flautist based in Croydon, South London.",
    intro: [
      "I am Lashikala Hettiarachchi, a professional flautist holding the Licentiate of Trinity College London (LTCL) with over a decade of orchestral experience, including as Principal Flautist with the Gustav Mahler Society and performances with the Just Flute Orchestra UK.",
      "Whether you are picking up the flute for the first time, returning after a break, or working towards a graded exam or diploma, lessons are built around your goals — solid technique, beautiful tone, and music you actually enjoy playing.",
    ],
    featureGroups: [
      {
        title: "What lessons cover",
        items: [
          "Tone production, breathing and technique",
          "Classical repertoire from Baroque to contemporary",
          "Sight-reading and aural skills",
          "Pop and film music for fun and motivation",
        ],
      },
      {
        title: "Exams & performance",
        items: [
          "ABRSM and Trinity exam preparation (Grades 1–8 and beyond)",
          "Performance and audition coaching",
          "Music theory support alongside practical lessons",
          "Regular performance opportunities for students",
        ],
      },
    ],
    areas:
      "In-person lessons in Croydon, across London and Surrey — including South London, Caterham and Banstead. Online lessons available worldwide.",
    faqs: [
      {
        question: "Do you teach complete beginners?",
        answer:
          "Yes. Many of my students start with no prior musical experience. Lessons are tailored to your level, from first notes through to advanced repertoire.",
      },
      {
        question: "Do you prepare students for ABRSM and Trinity exams?",
        answer:
          "Yes. I am LTCL qualified (Licentiate of Trinity College London) and regularly prepare students for ABRSM and Trinity graded exams, from Grade 1 to diploma level.",
      },
      {
        question: "Where do lessons take place?",
        answer:
          "Lessons are held in Croydon, South London, with in-person tuition available across London and Surrey. Online lessons are available worldwide.",
      },
      {
        question: "How long is a lesson?",
        answer:
          "You can choose 30, 45, or 60-minute sessions, scheduled weekly or bi-weekly to suit you.",
      },
    ],
    ctaText:
      "Ready to start your flute journey? Get in touch to arrange your first Western flute lesson in London or online.",
  },
  "bansuri-lessons-croydon": {
    metaTitle: "Bansuri Lessons Croydon | Indian Flute Teacher London | Lflauto",
    metaDescription:
      "Learn the bansuri (Indian bamboo flute) in Croydon & London with Visharad-qualified flautist Lashikala Hettiarachchi. North Indian classical raags, Bollywood music & exam preparation. Online lessons available.",
    heading: "Bansuri & Indian Flute Lessons in Croydon",
    subheading:
      "Learn the Indian bamboo flute (bansuri) with a Visharad-qualified, four-time National Youth Award-winning flautist, based in Croydon and teaching across London.",
    intro: [
      "I am Lashikala Hettiarachchi, a Visharad-qualified flautist trained at Bhatkhande Sangeet Vidyapith, Lucknow — one of India's most respected institutions for Hindustani classical music. I won First Place in North Indian Classical Instrumental Flute at the National Youth Awards four times.",
      "Bansuri lessons introduce you to the world of raag — the melodic heart of Indian classical music — alongside the breathing, ornamentation, and ear training that give the bamboo flute its unmistakable voice. Students range from complete beginners to those preparing for Visharad exams.",
    ],
    featureGroups: [
      {
        title: "What lessons cover",
        items: [
          "Bansuri technique: blowing, fingering and meend (glides)",
          "North Indian raag repertoire, taan and alankar practice",
          "Bollywood and devotional melodies",
          "Indian music theory, notation and ear training",
        ],
      },
      {
        title: "Who it's for",
        items: [
          "Complete beginners — no prior music experience needed",
          "Western flute players crossing over to bansuri",
          "Students preparing for Visharad examinations",
          "Anyone seeking the meditative side of Indian music",
        ],
      },
    ],
    areas:
      "In-person bansuri lessons in Croydon, with tuition available across London and Surrey. Online lessons available worldwide.",
    faqs: [
      {
        question: "What is the bansuri?",
        answer:
          "The bansuri is the traditional Indian bamboo flute used in North Indian (Hindustani) classical music, as well as Bollywood and devotional music. It has a warm, meditative sound and is one of the oldest instruments in Indian music.",
      },
      {
        question: "Do I need my own bansuri to start?",
        answer:
          "It helps, but I can advise you on choosing your first bansuri — the right key and size makes early learning much easier. Beginners usually start on a medium-sized flute such as a G or A bass.",
      },
      {
        question: "Are you qualified in Indian classical music?",
        answer:
          "Yes. I hold the Visharad qualification from Bhatkhande Sangeet Vidyapith, Lucknow, and won First Place in North Indian Classical Instrumental Flute at Sri Lanka's National Youth Awards four times (2012, 2015, 2017, 2019).",
      },
      {
        question: "Can I learn bansuri online?",
        answer:
          "Yes. Alongside in-person lessons in Croydon and London, I teach bansuri online to students worldwide.",
      },
    ],
    ctaText:
      "Curious about the bansuri? Get in touch to arrange your first Indian flute lesson in Croydon, London, or online.",
  },
  "flute-performance-events": {
    metaTitle: "Flute Performances for Weddings & Events | London | Lflauto",
    metaDescription:
      "Book professional live flute music for weddings, corporate events & parties in London, Croydon & Surrey. Western classical, Bollywood & fusion on flute and bansuri — solo or with ensemble.",
    heading: "Live Flute Performances for Events",
    subheading:
      "Elegant live flute music for weddings, corporate events, and private celebrations — performed by a professional flautist based in Croydon, London.",
    intro: [
      "I am Lashikala Hettiarachchi, an LTCL-qualified professional flautist with orchestral experience as Principal Flautist for the Gustav Mahler Society and current member of the Just Flute Orchestra UK and Viraaga Orchestra. My UK performances include concerts in Glasgow, High Wycombe, and the Bank of Ceylon London 75th Anniversary Concert.",
      "From a serene classical set during a wedding ceremony to lively Bollywood and fusion numbers at a reception, each performance is tailored to your event — on Western concert flute, Indian bansuri, or both.",
    ],
    featureGroups: [
      {
        title: "Performance options",
        items: [
          "Solo flute with professional backing tracks",
          "Optional tabla, drums, bass, percussion and sitar accompaniment",
          "Western concert flute and Indian bansuri",
          "Customisable set lists to match your event",
        ],
      },
      {
        title: "Repertoire",
        items: [
          "Western classical — Bach, Mozart, romantic favourites",
          "Bollywood hits and Sri Lankan classics",
          "Pop songs and film themes",
          "East-West fusion and raag-based meditative music",
        ],
      },
    ],
    areas:
      "Available for events in London, Croydon, Surrey and across the UK. Based in Croydon, South London.",
    faqs: [
      {
        question: "What kinds of events do you perform at?",
        answer:
          "Weddings, receptions, corporate events, cultural celebrations, private parties, and candlelight-style concerts. Recent UK performances include Glasgow, High Wycombe, and the Bank of Ceylon London 75th Anniversary Concert.",
      },
      {
        question: "What music styles can you perform?",
        answer:
          "Western classical, Bollywood, Sri Lankan favourites, pop, film themes, and East-West fusion — performed on Western concert flute or Indian bansuri, with professional backing tracks or live accompaniment.",
      },
      {
        question: "Can you bring accompanying musicians?",
        answer:
          "Yes. Optional tabla, drums, bass guitar, percussion, and sitar accompaniment is available, from an intimate solo set to a small ensemble.",
      },
      {
        question: "Which areas do you cover?",
        answer:
          "Based in Croydon, I regularly perform across London, Surrey, and throughout the UK. Travel further afield can be arranged — get in touch with your event details.",
      },
    ],
    ctaText:
      "Planning a wedding, corporate event, or celebration? Get in touch with your date and venue for availability and a quote.",
  },
};

function mergePages(saved: Partial<ServicePagesData> | null): ServicePagesData {
  const slugs = Object.keys(DEFAULT_SERVICE_PAGES) as ServicePageSlug[];
  return Object.fromEntries(
    slugs.map((slug) => [slug, { ...DEFAULT_SERVICE_PAGES[slug], ...saved?.[slug] }])
  ) as ServicePagesData;
}

/** Public read — falls back to built-in defaults if the file doesn't exist yet. */
export async function fetchServicePages(): Promise<ServicePagesData> {
  try {
    const res = await fetch(`${S3_BASE}/${S3_KEY}?t=${Date.now()}`);
    if (!res.ok) return DEFAULT_SERVICE_PAGES;
    return mergePages(await res.json());
  } catch {
    return DEFAULT_SERVICE_PAGES;
  }
}

/** Admin write — saves all service pages in one file. */
export async function saveServicePages(pages: ServicePagesData): Promise<void> {
  const client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
    },
    requestChecksumCalculation: "WHEN_REQUIRED" as const,
    responseChecksumValidation: "WHEN_REQUIRED" as const,
  });
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: S3_KEY, ContentType: "application/json" }),
    { expiresIn: 3600 }
  );
  const res = await fetch(url, {
    method: "PUT",
    body: JSON.stringify(pages, null, 2),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const code = txt.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? res.status;
    const msg = txt.match(/<Message>([^<]+)<\/Message>/)?.[1] ?? res.statusText;
    throw new Error(`${code}: ${msg}`);
  }
}

/**
 * Called by the admin editor on open. Creates data/service-pages.json with the
 * defaults if it doesn't exist, so public GETs never 403 (same pattern as articles).
 */
export async function ensureServicePages(): Promise<ServicePagesData> {
  try {
    const res = await fetch(`${S3_BASE}/${S3_KEY}?t=${Date.now()}`);
    if (res.ok) return mergePages(await res.json());
    await saveServicePages(DEFAULT_SERVICE_PAGES);
    return DEFAULT_SERVICE_PAGES;
  } catch {
    return DEFAULT_SERVICE_PAGES;
  }
}

/** Load content for one service page — defaults render immediately, S3 content follows. */
export function useServicePageContent(slug: ServicePageSlug): ServicePageContent {
  const [content, setContent] = useState<ServicePageContent>(DEFAULT_SERVICE_PAGES[slug]);
  useEffect(() => {
    let cancelled = false;
    fetchServicePages().then((pages) => {
      if (!cancelled) setContent(pages[slug]);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return content;
}
