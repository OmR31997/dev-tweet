import { AuthCard, ResetPasswordForm } from "@/components/features/auth";
import { createPageMetadata } from "@/lib/seo/metadata";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = createPageMetadata({
  title: "Reset password",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Choose a new password"
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
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
