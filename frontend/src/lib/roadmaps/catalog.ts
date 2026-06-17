import type { RoadmapCatalogItem, RoadmapGroup } from "./types";

export const ROADMAP_CATALOG: RoadmapCatalogItem[] = [
  {
    slug: "frontend",
    title: "Frontend",
    description: "Step-by-step guide to becoming a modern frontend developer.",
    group: "web",
  },
  {
    slug: "react",
    title: "React",
    description: "Everything you need to know about React.",
    group: "web",
  },
  {
    slug: "nextjs",
    title: "Next.js",
    description: "Learn Next.js for production React applications.",
    group: "web",
  },
  {
    slug: "vue",
    title: "Vue",
    description: "Guide to learning Vue.js.",
    group: "web",
  },
  {
    slug: "angular",
    title: "Angular",
    description: "Guide to becoming an Angular developer.",
    group: "web",
  },
  {
    slug: "typescript",
    title: "TypeScript",
    description: "Learn TypeScript for type-safe JavaScript.",
    group: "web",
  },
  {
    slug: "javascript",
    title: "JavaScript",
    description: "Everything you need to know about JavaScript.",
    group: "languages",
  },
  {
    slug: "html",
    title: "HTML",
    description: "Learn HTML fundamentals for the web.",
    group: "web",
  },
  {
    slug: "css",
    title: "CSS",
    description: "Master CSS styling and layout.",
    group: "web",
  },
  {
    slug: "backend",
    title: "Backend",
    description: "Step-by-step guide to becoming a backend developer.",
    group: "backend",
  },
  {
    slug: "nodejs",
    title: "Node.js",
    description: "Learn Node.js for server-side JavaScript.",
    group: "backend",
  },
  {
    slug: "python",
    title: "Python",
    description: "Guide to learning Python programming.",
    group: "languages",
  },
  {
    slug: "golang",
    title: "Go",
    description: "Guide to learning Go programming.",
    group: "languages",
  },
  {
    slug: "java",
    title: "Java",
    description: "Guide to learning Java.",
    group: "languages",
  },
  {
    slug: "spring-boot",
    title: "Spring Boot",
    description: "Learn Spring Boot for Java backends.",
    group: "backend",
  },
  {
    slug: "django",
    title: "Django",
    description: "Learn Django for Python web development.",
    group: "backend",
  },
  {
    slug: "sql",
    title: "SQL",
    description: "Learn SQL for database management.",
    group: "backend",
  },
  {
    slug: "mongodb",
    title: "MongoDB",
    description: "Guide to learning MongoDB.",
    group: "backend",
  },
  {
    slug: "devops",
    title: "DevOps",
    description: "Step-by-step guide to DevOps.",
    group: "devops",
  },
  {
    slug: "docker",
    title: "Docker",
    description: "Learn Docker for containerization.",
    group: "devops",
  },
  {
    slug: "kubernetes",
    title: "Kubernetes",
    description: "Guide to learning Kubernetes.",
    group: "devops",
  },
  {
    slug: "aws",
    title: "AWS",
    description: "Learn Amazon Web Services.",
    group: "devops",
  },
  {
    slug: "system-design",
    title: "System Design",
    description: "Learn how to design scalable systems.",
    group: "career",
  },
  {
    slug: "computer-science",
    title: "Computer Science",
    description: "Computer science fundamentals for developers.",
    group: "career",
  },
  {
    slug: "datastructures-and-algorithms",
    title: "DSA",
    description: "Data structures and algorithms for interviews.",
    group: "career",
  },
  {
    slug: "full-stack",
    title: "Full Stack",
    description: "Guide to becoming a full stack developer.",
    group: "career",
  },
  {
    slug: "cyber-security",
    title: "Cyber Security",
    description: "Guide to cyber security for developers.",
    group: "career",
  },
  {
    slug: "machine-learning",
    title: "Machine Learning",
    description: "Guide to machine learning fundamentals.",
    group: "career",
  },
];

const GROUP_ORDER: RoadmapGroup[] = [
  "web",
  "backend",
  "devops",
  "languages",
  "career",
];

export function getRoadmapBySlug(slug: string): RoadmapCatalogItem | undefined {
  return ROADMAP_CATALOG.find((item) => item.slug === slug);
}

export function groupRoadmaps(
  items: RoadmapCatalogItem[],
): Record<RoadmapGroup, RoadmapCatalogItem[]> {
  const grouped = Object.fromEntries(
    GROUP_ORDER.map((g) => [g, [] as RoadmapCatalogItem[]]),
  ) as Record<RoadmapGroup, RoadmapCatalogItem[]>;

  for (const item of items) {
    grouped[item.group].push(item);
  }

  return grouped;
}

export function filterRoadmaps(query: string): RoadmapCatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return ROADMAP_CATALOG;

  return ROADMAP_CATALOG.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q),
  );
}

export { GROUP_ORDER };
