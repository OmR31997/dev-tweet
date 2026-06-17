"use client";

import { cn } from "@/lib/utils";
import type { RoadmapFlowNodeData } from "@/lib/roadmaps/parse-roadmap";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export function RoadmapFlowNode({ data, selected }: NodeProps) {
  const nodeData = data as RoadmapFlowNodeData;
  const isTitle = nodeData.nodeType === "title";
  const isSubtopic = nodeData.nodeType === "subtopic";

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-lg border px-2 py-1 text-center text-xs font-medium leading-tight transition-shadow",
        isTitle
          ? "border-primary bg-primary/10 text-primary"
          : isSubtopic
            ? "border-border bg-card text-foreground"
            : "border-primary/40 bg-background text-foreground",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <span className="line-clamp-3">{nodeData.label}</span>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}
