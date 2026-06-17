"use client";

import { useState } from "react";

export function useMessageSelection() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [forwardIds, setForwardIds] = useState<string[]>([]);
  const [forwardOpen, setForwardOpen] = useState(false);

  const enterSelection = (messageId?: string) => {
    setSelectionMode(true);
    if (messageId) {
      setSelectedIds(new Set([messageId]));
    }
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (messageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  };

  const openForward = (ids: string[]) => {
    setForwardIds(ids);
    setForwardOpen(true);
  };

  const closeForward = () => {
    setForwardOpen(false);
    setForwardIds([]);
  };

  return {
    selectionMode,
    selectedIds,
    forwardIds,
    forwardOpen,
    enterSelection,
    exitSelection,
    toggleSelect,
    openForward,
    closeForward,
  };
}
