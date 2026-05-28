import Link from "next/link";
import type { Metadata } from "next";
import { ROUTES } from "@/lib/constants";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your account and get started.",
};

/**
 * Signup page.
 */
export default function SignupPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Start building your digital store today
        </p>
      </div>

      <SignupForm />

      {/* Footer link */}
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={ROUTES.login}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
