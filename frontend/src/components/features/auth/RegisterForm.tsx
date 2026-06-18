"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { getErrorMessage, useRegister } from "@/lib/api";
import {
  isAllowedSignupEmail,
  SIGNUP_EMAIL_REJECTED_MESSAGE,
} from "@/lib/email-policy";
import { useState } from "react";

export function RegisterForm() {
  const register = useRegister();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const emailInvalid =
    emailTouched && email.trim().length > 0 && !isAllowedSignupEmail(email);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    const trimmedEmail = email.trim();
    if (!isAllowedSignupEmail(trimmedEmail)) {
      return;
    }

    register.mutate({
      displayName: displayName.trim(),
      email: trimmedEmail,
      password,
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          autoComplete="name"
          required
          minLength={2}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ada Lovelace"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          placeholder="you@gmail.com"
          aria-invalid={emailInvalid}
        />
        {emailInvalid ? (
          <p className="text-sm text-destructive">{SIGNUP_EMAIL_REJECTED_MESSAGE}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Use your real email. Temporary or disposable addresses are not allowed.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
      </div>

      {register.isError ? (
        <p className="text-sm text-destructive">
          {getErrorMessage(register.error)}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full"
        disabled={register.isPending || emailInvalid}
      >
        {register.isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
