"use client";

import { fetchGithubActivity } from "@/lib/github/fetch-activity";
import { queryKeys } from "../query-keys";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const REFRESH_MS = 60_000;

export function useGithubActivity(username?: string) {
  return useQuery({
    queryKey: queryKeys.github.activity(username ?? ""),
    queryFn: () => fetchGithubActivity(username!),
    enabled: Boolean(username),
    placeholderData: keepPreviousData,
    refetchInterval: REFRESH_MS,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
  });
}
