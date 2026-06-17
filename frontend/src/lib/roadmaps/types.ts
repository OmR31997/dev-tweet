export type RoadmapGroup =
  | "web"
  | "backend"
  | "devops"
  | "languages"
  | "career";

export interface RoadmapCatalogItem {
  slug: string;
  title: string;
  description: string;
  group: RoadmapGroup;
}

export interface RoadmapJsonNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  data?: {
    label?: string;
    oldId?: string;
    style?: Record<string, unknown>;
  };
}

export interface RoadmapJsonEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  style?: Record<string, unknown>;
}

export interface RoadmapJson {
  nodes: RoadmapJsonNode[];
  edges: RoadmapJsonEdge[];
}

export interface ParsedRoadmapNode {
  id: string;
  type: "topic" | "subtopic" | "title";
  label: string;
  oldId?: string;
}

export interface ParsedRoadmap {
  nodes: ParsedRoadmapNode[];
  edges: RoadmapJsonEdge[];
}
