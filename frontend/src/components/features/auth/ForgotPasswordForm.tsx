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
    forgot.mutate({ email: email.trim() });
  };

  if (forgot.isSuccess) {
    return (
      <p className="text-sm text-muted-foreground">
        If an account exists for <strong>{email}</strong>, we&apos;ve sent a
        password reset link. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      {forgot.isError ? (
        <p className="text-sm text-destructive">
          {getErrorMessage(forgot.error)}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={forgot.isPending}>
        {forgot.isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
