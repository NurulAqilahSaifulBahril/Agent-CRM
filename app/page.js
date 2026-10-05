import { connection } from "next/server";
import LoginForm from "@/components/LoginForm";
import SetupForm from "@/components/SetupForm";
import { hasAgents } from "@/lib/store";

export default async function LoginPage() {
  // Checked on every visit, not at build time: a new install shows setup until
  // its first agent is added.
  await connection();
  return (await hasAgents()) ? <LoginForm /> : <SetupForm />;
}
