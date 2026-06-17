import type { Edge, Node } from "@xyflow/react";
import type {
  ParsedRoadmap,
  ParsedRoadmapNode,
  RoadmapJson,
  RoadmapJsonNode,
} from "./types";

const VISIBLE_NODE_TYPES = new Set(["topic", "subtopic", "title"]);

function isVisibleNode(node: RoadmapJsonNode): node is RoadmapJsonNode & {
  type: "topic" | "subtopic" | "title";
} {
  return VISIBLE_NODE_TYPES.has(node.type);
}

export function parseRoadmapJson(data: RoadmapJson): ParsedRoadmap {
  const nodes: ParsedRoadmapNode[] = data.nodes
    .filter(isVisibleNode)
    .filter((node) => (node.data?.label ?? "").trim().length > 0)
    .map((node) => ({
      id: node.id,
      type: node.type,
      label: node.data!.label!.trim(),
      oldId: node.data?.oldId,
    }));

  const visibleIds = new Set(nodes.map((n) => n.id));
  const edges = data.edges.filter(
    (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target),
  );

  return { nodes, edges };
}

export type RoadmapFlowNodeData = {
  label: string;
  nodeType: "topic" | "subtopic" | "title";
  oldId?: string;
};

export function toFlowNodes(
  parsed: ParsedRoadmap,
  raw: RoadmapJson,
): Node<RoadmapFlowNodeData>[] {
  const rawById = new Map(raw.nodes.map((n) => [n.id, n]));

  return parsed.nodes.map((node) => {
    const rawNode = rawById.get(node.id);
    const width = rawNode?.width ?? (node.type === "title" ? 200 : 160);
    const height = rawNode?.height ?? 48;

    return {
      id: node.id,
      type: "roadmap",
      position: rawNode?.position ?? { x: 0, y: 0 },
      data: {
        label: node.label,
        nodeType: node.type,
        oldId: node.oldId,
      },
      style: { width, height },
    };
  });
}

export function toFlowEdges(parsed: ParsedRoadmap): Edge[] {
  return parsed.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: false,
    style: {
      stroke: "var(--primary)",
      strokeWidth: 2,
      opacity: 0.6,
    },
  }));
}

export function roadmapShUrl(slug: string, node?: ParsedRoadmapNode): string {
  if (!node?.oldId) return `https://roadmap.sh/${slug}`;
  return `https://roadmap.sh/${slug}#${node.oldId}`;
}
