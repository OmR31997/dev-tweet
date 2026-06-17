import { apiClient } from "./client";
import { getClientApiBaseUrl } from "@/config/env";

/** Fetch an uploaded file through the authenticated API proxy. */
export async function fetchFileBlob(urlOrPath: string): Promise<Blob> {
  const base = getClientApiBaseUrl();
  const path = urlOrPath.startsWith(base)
    ? urlOrPath.slice(base.length)
    : urlOrPath.startsWith("/")
      ? urlOrPath
      : `/${urlOrPath}`;

  const { data } = await apiClient.get<Blob>(path, {
    responseType: "blob",
  });
  return data;
}
