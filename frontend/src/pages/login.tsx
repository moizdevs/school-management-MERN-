import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { errMsg } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-pine-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgb(31_122_102/0.55),transparent),radial-gradient(40%_40%_at_90%_100%,rgb(224_185_104/0.18),transparent)]" />
        <div aria-hidden className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)]" />
        <div className="relative flex items-center gap-2.5">
          <img src="/logo.png" alt="School Management System Logo" className="w-24 h-20 invert" />
        </div>
        <div className="relative max-w-md animate-rise">
          <p className="font-display text-6xl leading-[0.95] tracking-tight text-balance">
            Every class, every child, <em className="text-brass-300">in one place.</em>
          </p>
          <p className="mt-6 text-pine-100/75 text-pretty">
            Attendance, timetables, assignments and results — calm tools for the people who run a school day.
          </p>
        </div>
        <p className="relative text-xs text-pine-100/50">© {new Date().getFullYear()} Schoolmanage</p>
      </aside>
      <main className="grid place-items-center px-5 py-12">
        <div className="w-full max-w-sm animate-rise">
          <h1 className="font-display text-5xl leading-none tracking-tight">{title}</h1>
          <p className="mt-3 mb-8 text-[15px] text-zinc-500">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function Login() {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in with the account your school gave you.">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="Email">{(id) => <Input id={id} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Please enter your email" />}</Field>
        <Field label="Password">{(id) => <Input id={id} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Please enter your password" />}</Field>
        <Button type="submit" loading={busy} className="mt-2">Sign in <ArrowRight className="size-4" aria-hidden /></Button>
        <Link to="/forgot-password" className="inline-flex min-h-11 items-center justify-center rounded-lg text-sm text-zinc-500 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pine-500">
          Forgot your password?
        </Link>
      </form>
    </AuthLayout>
  );
}
