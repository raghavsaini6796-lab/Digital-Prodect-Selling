import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/lib/constants";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account.",
};

/**
 * Login page — form UI only.
 * Form logic will be wired with React Hook Form + Zod + Supabase in Phase 2.
 */
export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to continue
        </p>
      </div>

      <LoginForm />

      {/* Footer link */}
      <p className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.signup}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
