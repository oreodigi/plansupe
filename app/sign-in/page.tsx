import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function SignInPage() {
  return <AuthShell title="Welcome back" subtitle="Sign in to continue planning your businesses."><AuthForm mode="sign-in"/></AuthShell>;
}
