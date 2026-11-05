import { MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api, errMsg } from "@/lib/api";
import { AuthLayout } from "./login";

const back = (
  <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg text-sm text-zinc-500 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-pine-500">
    Back to sign in
  </Link>
);

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/auth/forgot-password", { method: "POST", body: { email: email.trim() } });
      setSent(true);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll email you a link that's good for 15 minutes.">
      {sent ? (
        <div className="grid gap-4">
          <div role="status" className="flex items-start gap-3 rounded-xl bg-pine-50 p-4 text-sm text-pine-700 ring-1 ring-inset ring-pine-100">
            <MailCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> Check your inbox for the reset link.
          </div>
          {back}
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <Field label="Email">{(id) => <Input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
          <Button type="submit" loading={busy}>Send reset link</Button>
          {back}
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/auth/reset-password/${token}`, { method: "PATCH", body: { password: pw } });
      toast.success("Password updated. Please sign in.");
      nav("/login", { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="At least 6 characters.">
      <form onSubmit={submit} className="grid gap-4">
        <Field label="New password">{(id) => <Input id={id} type="password" minLength={6} required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />}</Field>
        <Button type="submit" loading={busy}>Update password</Button>
        {back}
      </form>
    </AuthLayout>
  );
}
