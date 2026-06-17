"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { queryKeys } from "../query-keys";
import { linkPreviewService } from "../services/link-preview.service";

export function useLinkPreview(url: string | null) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: queryKeys.linkPreview(url ?? ""),
    queryFn: () => linkPreviewService.fetch(url as string),
    enabled: Boolean(accessToken) && Boolean(url),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}
