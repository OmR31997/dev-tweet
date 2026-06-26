import { UserAvatar } from "@/components/common/UserAvatar";
import type { Post } from "@/lib/api";
import Link from "next/link";
import { PostContent } from "./PostContent";
import { PostMedia } from "./PostMedia";

/** LinkedIn-style quoted post inside a repost — left accent, no nested card box. */
export function RepostEmbed({ post }: { post: Post }) {
  return (
    <div className="mt-2 min-w-0 border-l-2 border-muted-foreground/25 pl-3">
      <div className="flex items-center gap-2">
        <Link href={`/profile/${post.authorId}`} className="shrink-0">
          <UserAvatar
            name={post.authorName}
            photoURL={post.authorPhoto}
            className="size-7"
          />
        </Link>
        <Link
          href={`/profile/${post.authorId}`}
          className="truncate text-sm font-semibold hover:underline"
        >
          {post.authorName}
        </Link>
      </div>

      <div className="mt-1">
        <PostContent content={post.content} />
      </div>

      <PostMedia post={post} embedded />
    </div>
  );
}
