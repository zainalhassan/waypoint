import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/user";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { PageHeader } from "@/components/transit/PageHeader";
import { SectionCard } from "@/components/transit/SectionCard";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserById(session.user.id);
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and preferences."
      />

      <SectionCard
        title="Profile & preferences"
        description="Your default currency is pre-filled when you add salary or deal amounts."
        headerColor="var(--color-route-blue)"
      >
        <SettingsForm
          name={user.name ?? ""}
          email={user.email}
          defaultCurrency={user.defaultCurrency}
        />
      </SectionCard>

      <SectionCard
        title="Password"
        description="Update your account password."
        headerColor="var(--color-route-purple)"
      >
        <ChangePasswordForm />
      </SectionCard>
    </div>
  );
}
