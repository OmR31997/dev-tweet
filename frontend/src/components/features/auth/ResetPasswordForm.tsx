"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { getErrorMessage, useResetPassword } from "@/lib/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const reset = useResetPassword();
  const [newPassword, setNewPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reset.mutate({ token, newPassword });
  };

  if (!token) {
    return (
      <p className="text-sm text-destructive">
        This reset link is invalid or has expired. Request a new one from the{" "}
        <Link href="/forgot-password" className="text-primary hover:underline">
          forgot password
        </Link>{" "}
        page.
      </p>
    );
  }

  if (reset.isSuccess) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your password has been reset. You can now sign in with your new
          password.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
      </div>

      {reset.isError ? (
        <p className="text-sm text-destructive">
          {getErrorMessage(reset.error)}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={reset.isPending}>
        {reset.isPending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
