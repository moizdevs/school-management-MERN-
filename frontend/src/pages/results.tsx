import { Medal, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { NeedProfile } from "@/components/need-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PageHeader, Stat } from "@/components/ui/misc";
import { Empty } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/mutate";
import { useExams, useMyProfileId, useStudents } from "@/lib/queries";
import type { ResultRec } from "@/lib/types";
import { fmtDate, pct } from "@/lib/utils";

export const percentOf = (r: ResultRec) => r.percentage != null ? Number(r.percentage) : pct(r.obtainedMarks, r.exam?.totalMarks ?? 0);

function ResultsTable({ studentId }: { studentId: string }) {
  const q = useQuery({
    queryKey: ["results", studentId],
    queryFn: async () => (await api<{ results: ResultRec[] }>(`/results/${studentId}`)).results,
  });
  const avg = q.data?.length ? Math.round(q.data.reduce((a, r) => a + percentOf(r), 0) / q.data.length) : 0;
  const passed = q.data?.filter((r) => r.status === "pass").length ?? 0;

  const columns: Column<ResultRec>[] = [
    { header: "Exam", cell: (r) => <div><p className="font-medium">{r.exam?.examName}</p><p className="text-xs text-zinc-500">{fmtDate(r.exam?.examDate)}</p></div> },
    { header: "Score", cell: (r) => <span className="font-medium">{r.obtainedMarks}<span className="text-zinc-400"> / {r.exam?.totalMarks}</span></span> },
    { header: "%", hideOnMobile: true, cell: (r) => `${percentOf(r)}%` },
    { header: "Grade", cell: (r) => <Badge tone="brass">{r.grade ?? "—"}</Badge> },
    { header: "Result", cell: (r) => r.status ? <Badge tone={r.status === "pass" ? "good" : "bad"}>{r.status}</Badge> : "—" },
    { header: "Remarks", hideOnMobile: true, cell: (r) => r.remarks || "—" },
  ];

  return (
    <div className="grid gap-6">
      {q.data?.length ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat tone="dark" i={0} label="Average" value={`${avg}%`} />
          <Stat i={1} label="Exams taken" value={q.data.length} />
          <Stat i={2} label="Passed" value={passed} hint={`${q.data.length - passed} not passed`} />
        </div>
      ) : null}
      <Card>
        <DataTable rows={q.data} columns={columns} rowKey={(r) => r._id} loading={q.isLoading} error={q.error?.message} onRetry={() => q.refetch()}
          empty={{ title: "No results recorded", body: "Results appear here once a teacher enters them." }} />
      </Card>
    </div>
  );
}

function AddResult({ studentId, onClose }: { studentId?: string; onClose: () => void }) {
  const exams = useExams();
  const students = useStudents();
  const save = useAction(
    (fd: FormData) => {
      const v = Object.fromEntries(fd) as Record<string, string>;
      return api("/results", { method: "POST", body: { studentId: v.studentId, examId: v.examId, obtainedMarks: Number(v.obtainedMarks), remarks: v.remarks } });
    },
    { success: "Result saved", invalidate: ["results"], onDone: onClose },
  );
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); };
  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Student">{(id) => (
        <Select id={id} name="studentId" required defaultValue={studentId ?? ""}>
          <option value="" disabled>Select student</option>
          {students.data?.map((s) => <option key={s._id} value={s._id}>{s.user?.name}{s.rollNumber ? ` (${s.rollNumber})` : ""}</option>)}
        </Select>
      )}</Field>
      <Field label="Exam">{(id) => (
        <Select id={id} name="examId" required defaultValue="">
          <option value="" disabled>Select exam</option>
          {exams.data?.map((e) => <option key={e._id} value={e._id}>{e.examName} — {e.subject?.subjectName} ({e.totalMarks})</option>)}
        </Select>
      )}</Field>
      <Field label="Marks obtained" hint="Grade, percentage and pass/fail are calculated for you.">{(id) => <Input id={id} name="obtainedMarks" type="number" min={0} step="0.5" required />}</Field>
      <Field label="Remarks">{(id) => <Textarea id={id} name="remarks" />}</Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>Save result</Button>
      </div>
    </form>
  );
}

export default function Results() {
  const { user } = useAuth();
  const myId = useMyProfileId();
  const students = useStudents();
  const [studentId, setStudentId] = useState("");
  const [adding, setAdding] = useState(false);
  const staff = user?.role !== "student";

  return (
    <>
      <PageHeader eyebrow={staff ? "Academics" : "My progress"} title="Results" description={staff ? "Look up a student's marks or record a new result." : "Your marks, grades and how you're trending."}
        actions={staff && <Button onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden />Record result</Button>} />

      {staff ? (
        <div className="grid gap-6">
          <Card><Card.Content className="max-w-md">
            <Field label="Student" hint={!students.data?.length && !students.isLoading ? "Your account can't list students. Open the student list as an admin, or enable GET /students for teachers (see BACKEND_NOTES.md)." : undefined}>
              {(id) => (
                <Select id={id} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                  <option value="">Choose a student…</option>
                  {students.data?.map((s) => <option key={s._id} value={s._id}>{s.user?.name}{s.class ? ` · ${s.class.className}` : ""}</option>)}
                </Select>
              )}
            </Field>
          </Card.Content></Card>
          {studentId ? <ResultsTable studentId={studentId} /> : <Card><Empty icon={Medal} title="Pick a student" body="Their results will show up here." /></Card>}
        </div>
      ) : myId ? <ResultsTable studentId={myId} /> : <Card><NeedProfile /></Card>}

      <Modal open={adding} onOpenChange={setAdding} title="Record result">{adding && <AddResult studentId={studentId || undefined} onClose={() => setAdding(false)} />}</Modal>
    </>
  );
}
