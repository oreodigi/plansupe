import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export default function SignUpPage() {
  return <AuthShell title="Create your workspace" subtitle="Start with one business and add more whenever you need."><AuthForm mode="sign-up"/></AuthShell>;
}
