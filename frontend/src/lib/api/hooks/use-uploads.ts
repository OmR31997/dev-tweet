"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadService } from "../services/upload.service";

export function useUploadChatFile() {
  return useMutation({
    mutationFn: (file: File) => uploadService.uploadChatFile(file),
  });
}
