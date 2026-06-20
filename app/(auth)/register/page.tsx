import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SectionCard } from "@/components/transit/SectionCard";

export default function RegisterPage() {
  return (
    <SectionCard
      title="Create account"
      description="Start tracking job applications, grad school, sales, and more."
      headerColor="var(--color-route-teal)"
    >
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </SectionCard>
  );
}
