"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, useForgotPassword } from "@/lib/api";
import { useState } from "react";

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    forgot.mutate({ email: trimmed });
  };

  if (forgot.isSuccess) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          If an account exists for <strong>{email}</strong>, we&apos;ve sent a
          password reset link. Check your inbox and spam folder.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => forgot.reset()}
        >
          Send again
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      <div className="space-y-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      {forgot.isError ? (
        <p className="text-sm text-destructive" role="alert">
          {getErrorMessage(forgot.error)}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={forgot.isPending || !email.trim()}
      >
        {forgot.isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
