"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile, updateBranding, sendPasswordReset } from "@/app/actions/auth";

interface ProfileFormProps {
  email: string;
  fullName: string | null;
  storeName: string | null;
  customDomain: string | null;
}

function StatusMessage({ error, success }: { error?: string | null; success?: string | null }) {
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (success) return <p className="text-sm text-green-600 dark:text-green-400">{success}</p>;
  return null;
}

/** Profile tab — full name */
export function ProfileForm({ email, fullName }: Pick<ProfileFormProps, "email" | "fullName">) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(formData);
      setStatus(result.error ? { error: result.error } : { success: "Profile updated!" });
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={fullName ?? ""}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile_email">Email</Label>
            <Input id="profile_email" type="email" value={email} disabled />
            <p className="text-[11px] text-muted-foreground">
              Email is managed by your authentication provider.
            </p>
          </div>
          <StatusMessage {...status} />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

/** Branding tab — store name + custom domain */
export function BrandingForm({ storeName, customDomain }: Pick<ProfileFormProps, "storeName" | "customDomain">) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateBranding(formData);
      setStatus(result.error ? { error: result.error } : { success: "Branding updated!" });
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Store Branding</CardTitle>
          <CardDescription>Customize how your store appears to customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name</Label>
            <Input
              id="store_name"
              name="store_name"
              defaultValue={storeName ?? ""}
              placeholder="My Digital Store"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom_domain">Custom Domain</Label>
            <Input
              id="custom_domain"
              name="custom_domain"
              defaultValue={customDomain ?? ""}
              placeholder="store.mywebsite.com"
            />
            <p className="text-[11px] text-muted-foreground">
              Point your domain's CNAME to our servers after saving.
            </p>
          </div>
          <StatusMessage {...status} />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Branding"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

/** Security tab — password reset */
export function SecurityForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error?: string; success?: string } | null>(null);

  function handleReset() {
    startTransition(async () => {
      const result = await sendPasswordReset();
      setStatus(
        result.error
          ? { error: result.error }
          : { success: result.message ?? "Password reset email sent!" }
      );
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>Update your password and security preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We will send a secure password reset link to your email address.
        </p>
        <StatusMessage {...status} />
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={handleReset} disabled={isPending}>
          {isPending ? "Sending…" : "Send Password Reset Email"}
        </Button>
      </CardFooter>
    </Card>
  );
}
