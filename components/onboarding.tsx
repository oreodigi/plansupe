import { SetupBuilder } from "@/components/setup-builder";

export function Onboarding({ firstName }: { firstName: string }) {
  return <main className="setup-page"><SetupBuilder firstName={firstName}/></main>;
}
