import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveImageUrl } from "@/lib/api";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name?: string;
  photoURL?: string | null;
  className?: string;
  showOnline?: boolean;
}

/** Avatar with image (resolved through the proxy) + initials fallback. */
export function UserAvatar({
  name,
  photoURL,
  className,
  showOnline,
}: UserAvatarProps) {
  const src = resolveImageUrl(photoURL);
  return (
    <div className={cn("relative inline-flex size-10 shrink-0", className)}>
      <Avatar className="size-full">
      {src ? (
        <AvatarImage
          src={src}
          alt={name ?? ""}
          className="size-full object-cover"
        />
      ) : null}
      <AvatarFallback
        delayMs={src ? 600 : 0}
        className="bg-primary/10 text-sm font-semibold leading-none text-primary"
      >
        {initials(name)}
      </AvatarFallback>
      </Avatar>
      {showOnline ? (
        <span
          className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card bg-[#25d366]"
          aria-label="Online"
        />
      ) : null}
    </div>
  );
}
