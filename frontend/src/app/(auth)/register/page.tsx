import { AuthCard, RegisterForm } from "@/components/features/auth";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = createPageMetadata({
  title: "Create account",
  description:
    "Join DevTweetHub — create a free account and start sharing with the developer community.",
  path: "/register",
});

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Join the DevTweetHub developer community"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
