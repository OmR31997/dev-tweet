"use client";

import {
  parseRoadmapJson,
  toFlowEdges,
  toFlowNodes,
  type RoadmapFlowNodeData,
} from "@/lib/roadmaps/parse-roadmap";
import type { ParsedRoadmapNode, RoadmapJson } from "@/lib/roadmaps/types";
import { cn } from "@/lib/utils";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo } from "react";
import { RoadmapFlowNode } from "./RoadmapFlowNode";

const nodeTypes = { roadmap: RoadmapFlowNode };

function RoadmapFlowCanvasInner({
  data,
  onSelectNode,
}: {
  data: RoadmapJson;
  onSelectNode: (node: ParsedRoadmapNode | null) => void;
}) {
  const { fitView } = useReactFlow();
  const { resolvedTheme } = useTheme();
  const parsed = useMemo(() => parseRoadmapJson(data), [data]);
  const nodes = useMemo(() => toFlowNodes(parsed, data), [parsed, data]);
  const edges = useMemo(() => toFlowEdges(parsed), [parsed]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fitView({ padding: 0.15, duration: 300 });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [fitView, nodes]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<RoadmapFlowNodeData>) => {
      const match = parsed.nodes.find((n) => n.id === node.id);
      onSelectNode(match ?? null);
    },
    [onSelectNode, parsed.nodes],
  );

  const onPaneClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      fitView
      minZoom={0.05}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      className={cn("bg-muted/20", resolvedTheme === "dark" && "dark")}
    >
      <Background gap={16} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

export function RoadmapFlowCanvas({
  data,
  onSelectNode,
}: {
  data: RoadmapJson;
  onSelectNode: (node: ParsedRoadmapNode | null) => void;
}) {
  return (
    <ReactFlowProvider>
      <div className="h-full min-h-[420px] w-full">
        <RoadmapFlowCanvasInner data={data} onSelectNode={onSelectNode} />
      </div>
    </ReactFlowProvider>
  );
}
