import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in to Waypoint</CardTitle>
        <CardDescription>
          Track pipelines and visualize your progress.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {params.registered && (
          <p className="text-sm text-green-600">
            Account created. You can sign in now.
          </p>
        )}
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
