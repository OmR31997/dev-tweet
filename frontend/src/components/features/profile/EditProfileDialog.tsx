"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getErrorMessage,
  useUpdateProfile,
  useUploadImage,
  type AuthUser,
} from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function EditProfileDialog({
  user,
  open,
  onClose,
}: {
  user: AuthUser;
  open: boolean;
  onClose: () => void;
}) {
  const update = useUpdateProfile();
  const upload = useUploadImage();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [college, setCollege] = useState(user.college ?? "");
  const [branch, setBranch] = useState(user.branch ?? "");
  const [year, setYear] = useState(user.year ?? "");
  const [photoURL, setPhotoURL] = useState(user.photoURL ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onPickPhoto = async (file?: File) => {
    if (!file) return;
    setError(null);
    try {
      const result = await upload.mutateAsync(file);
      setPhotoURL(result.id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      {
        displayName: displayName.trim(),
        bio: bio.trim(),
        college: college.trim(),
        branch: branch.trim(),
        year: year.trim(),
        photoURL,
      },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(getErrorMessage(err)),
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">Edit profile</h2>

        <div className="flex items-center gap-4">
          <UserAvatar
            name={displayName}
            photoURL={photoURL}
            className="size-16"
          />
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={upload.isPending}
            >
              {upload.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Change photo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPickPhoto(e.target.files?.[0])}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            maxLength={200}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="college">College</Label>
            <Input
              id="college"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
