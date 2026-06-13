import { AuthCard, ForgotPasswordForm } from "@/components/features/auth";
import { createPageMetadata } from "@/lib/seo/metadata";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = createPageMetadata({
  title: "Forgot password",
  path: "/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
