import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveImageUrl } from "@/lib/api";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string;
  photoURL?: string | null;
  className?: string;
}

/** Avatar with image (resolved through the proxy) + initials fallback. */
export function UserAvatar({ name, photoURL, className }: UserAvatarProps) {
  const src = resolveImageUrl(photoURL);
  return (
    <Avatar className={cn("size-10", className)}>
      {src ? <AvatarImage src={src} alt={name ?? ""} /> : null}
      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
