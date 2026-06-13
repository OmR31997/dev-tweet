import { AuthCard, LoginForm } from "@/components/features/auth";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = createPageMetadata({
  title: "Sign in",
  description:
    "Sign in to DevTweetHub to access your developer feed, messages, and notifications.",
  path: "/login",
});

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your DevTweetHub account"
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
