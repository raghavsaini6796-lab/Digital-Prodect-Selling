import type { Metadata } from "next";
import { User, Palette, Key, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/page-header";
import { SectionLayout } from "@/components/common/section-layout";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm, BrandingForm, SecurityForm } from "@/components/dashboard/settings-forms";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, store_name, custom_domain")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <SectionLayout>
      <PageHeader
        title="Settings"
        description="Manage your account settings, branding, and integrations."
      />

      <Tabs defaultValue="profile" className="w-full flex flex-col md:flex-row gap-6">
        {/* Tab sidebar */}
        <TabsList className="flex flex-row md:flex-col justify-start h-auto bg-transparent p-0 w-full md:w-48 overflow-x-auto shrink-0 border-b md:border-b-0 md:border-r rounded-none pb-2 md:pb-0 gap-1">
          <TabsTrigger value="profile" className="justify-start w-full data-[state=active]:bg-muted rounded-md">
            <User className="mr-2 h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="branding" className="justify-start w-full data-[state=active]:bg-muted rounded-md">
            <Palette className="mr-2 h-4 w-4" /> Branding
          </TabsTrigger>
          <TabsTrigger value="api" className="justify-start w-full data-[state=active]:bg-muted rounded-md">
            <Key className="mr-2 h-4 w-4" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="security" className="justify-start w-full data-[state=active]:bg-muted rounded-md">
            <Shield className="mr-2 h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Tab content */}
        <div className="flex-1 max-w-2xl">

          {/* Profile tab — client form wired to updateProfile action */}
          <TabsContent value="profile" className="mt-0 border-none p-0">
            <ProfileForm
              email={user?.email ?? ""}
              fullName={profile?.full_name ?? null}
            />
          </TabsContent>

          {/* Branding tab — client form wired to updateBranding action */}
          <TabsContent value="branding" className="mt-0 border-none p-0">
            <BrandingForm
              storeName={profile?.store_name ?? null}
              customDomain={profile?.custom_domain ?? null}
            />
          </TabsContent>

          {/* API Keys tab — informational, keys stored in env not DB */}
          <TabsContent value="api" className="mt-0 border-none p-0">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Manage your external integrations. Keys are stored securely
                  in server environment variables — not in the database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai_key">OpenAI API Key</Label>
                  <Input
                    id="openai_key"
                    type="password"
                    placeholder={
                      process.env.OPENAI_API_KEY ? "sk-••••••••••••" : "Not configured"
                    }
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe_key">Stripe Secret Key</Label>
                  <Input
                    id="stripe_key"
                    type="password"
                    placeholder={
                      process.env.STRIPE_SECRET_KEY ? "sk_••••••••••••" : "Not configured"
                    }
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  To add or update API keys, edit your{" "}
                  <code className="font-mono bg-muted px-1 py-0.5 rounded text-[11px]">
                    .env.local
                  </code>{" "}
                  file and restart the server.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security tab — client form wired to sendPasswordReset action */}
          <TabsContent value="security" className="mt-0 border-none p-0">
            <SecurityForm />
          </TabsContent>

        </div>
      </Tabs>
    </SectionLayout>
  );
}
