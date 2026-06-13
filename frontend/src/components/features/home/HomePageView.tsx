"use client";

import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/ui";
import { useAuthHasHydrated, useIsAuthenticated } from "@/store";
import { Bell, MessageCircle, PenSquare, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const FEATURES = [
  {
    icon: PenSquare,
    title: "Share your work",
    body: "Post updates, drop code snippets, and tag topics with #hashtags.",
  },
  {
    icon: Users,
    title: "Follow developers",
    body: "Build your network and keep up with the people you learn from.",
  },
  {
    icon: MessageCircle,
    title: "Direct messages",
    body: "Slide into DMs with real-time chat and typing indicators.",
  },
  {
    icon: Bell,
    title: "Stay in the loop",
    body: "Instant notifications for likes, follows, and replies.",
  },
];

export function HomePageView() {
  const router = useRouter();
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/feed");
    }
  }, [hasHydrated, isAuthenticated, router]);

  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            D
          </span>
          DevTweetHub
        </span>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Where developers <span className="text-primary">connect</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Share what you&apos;re building, follow other developers, and message
          directly — all in one community feed.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card p-6 text-left"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DevTweetHub
      </footer>
    </div>
  );
}
