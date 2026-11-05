import { CalendarClock, ExternalLink, FileText, Paperclip, Plus, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/confirm";
import { RowActions } from "@/components/row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Avatar, PageHeader } from "@/components/ui/misc";
import { Empty, ErrorState, TableSkeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/mutate";
import { idOf, useClasses, useSections, useSubjects } from "@/lib/queries";
import type { AssignmentRec, SubmissionRec } from "@/lib/types";
import { fmtDate, toInputDate } from "@/lib/utils";

const nameOf = (x: unknown, k: string) => (typeof x === "object" && x ? ((x as Record<string, string>)[k]) : undefined);
const fileUrl = (a?: { url?: string; ulr?: string }) => a?.url || a?.ulr;
const isOverdue = (a: AssignmentRec) => !!a.dueDate && new Date(a.dueDate) < new Date();

function CreateAssignment({ onClose }: { onClose: () => void }) {
  const classes = useClasses();
  const subjects = useSubjects();
  const [classId, setClassId] = useState("");
  const sections = useSections(classId || undefined);
  const save = useAction(
    (fd: FormData) => {
      fd.set("classId", classId);
      if (!(fd.get("file") as File)?.size) fd.delete("file");
      return api("/assignments", { method: "POST", form: fd });
    },
    { success: "Assignment posted", invalidate: ["assignments"], onDone: onClose },
  );
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); };
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Title" className="sm:col-span-2">{(id) => <Input id={id} name="title" required />}</Field>
      <Field label="Class">{(id) => (
        <Select id={id} required value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="" disabled>Select class</option>{classes.data?.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
        </Select>
      )}</Field>
      <Field label="Section">{(id) => (
        <Select id={id} name="sectionId" required disabled={!classId} key={classId} defaultValue="">
          <option value="" disabled>Select section</option>{sections.data?.map((s) => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
        </Select>
      )}</Field>
      <Field label="Subject">{(id) => (
        <Select id={id} name="subjectId" required disabled={!classId} key={`s${classId}`} defaultValue="">
          <option value="" disabled>Select subject</option>{subjects.data?.filter((s) => idOf(s.class) === classId).map((s) => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
        </Select>
      )}</Field>
      <Field label="Due date">{(id) => <Input id={id} name="dueDate" type="date" />}</Field>
      <Field label="Instructions" className="sm:col-span-2">{(id) => <Textarea id={id} name="description" />}</Field>
      <Field label="Attachment" hint="Optional — PDF, image or document" className="sm:col-span-2">
        {(id) => <Input id={id} name="file" type="file" className="py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-pine-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-pine-700" />}
      </Field>
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>Post assignment</Button>
      </div>
    </form>
  );
}

function ReviewRow({ sub, max }: { sub: SubmissionRec; max?: number }) {
  const [editing, setEditing] = useState(false);
  const save = useAction(
    (fd: FormData) => api(`/submissions/review/${sub._id}`, { method: "PUT", body: { teacherRemarks: fd.get("remarks"), marksAwarded: Number(fd.get("marks")), status: "reviewed" } }),
    { success: "Review saved", invalidate: ["submissions"], onDone: () => setEditing(false) },
  );
  const stu = typeof sub.student === "string" ? undefined : sub.student;
  return (
    <li className="rounded-xl bg-white p-4 shadow-[0_0_0_1px_rgb(20_23_26/0.07)]">
      <div className="flex items-center gap-3">
        <Avatar name={stu?.user?.name} />
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{stu?.user?.name ?? "Student"}</p><p className="text-xs text-zinc-500">Submitted {fmtDate(sub.submittedAt)}</p></div>
        <Badge tone={sub.status === "reviewed" ? "good" : "warn"}>{sub.status}</Badge>
      </div>
      {sub.submissionText && <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{sub.submissionText}</p>}
      {fileUrl(sub.attachment) && <a href={fileUrl(sub.attachment)} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-pine-600 hover:underline"><Paperclip className="size-4" aria-hidden />Open attachment<ExternalLink className="size-3" aria-hidden /></a>}
      {editing ? (
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); }} className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]">
          <Field label={`Marks${max ? ` / ${max}` : ""}`}>{(id) => <Input id={id} name="marks" type="number" min={0} step="0.5" required defaultValue={sub.marksAwarded} />}</Field>
          <Field label="Feedback">{(id) => <Input id={id} name="remarks" defaultValue={sub.teacherRemarks} />}</Field>
          <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" size="sm" loading={save.isPending}>Save review</Button></div>
        </form>
      ) : (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-900/5 pt-3">
          <p className="text-sm text-zinc-600">{sub.status === "reviewed" ? <><span className="font-semibold tabular-nums">{sub.marksAwarded ?? "—"}</span>{max ? ` / ${max}` : ""}{sub.teacherRemarks ? ` · ${sub.teacherRemarks}` : ""}</> : "Awaiting review"}</p>
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>{sub.status === "reviewed" ? "Edit" : "Review"}</Button>
        </div>
      )}
    </li>
  );
}

function Submissions({ a }: { a: AssignmentRec }) {
  const q = useQuery({ queryKey: ["submissions", a._id], queryFn: async () => (await api<{ submissions: SubmissionRec[] }>(`/submissions/assignment/${a._id}`)).submissions });
  if (q.isLoading) return <TableSkeleton rows={3} />;
  if (q.error) return <ErrorState message={q.error.message} onRetry={() => q.refetch()} />;
  if (!q.data?.length) return <Empty title="No submissions yet" body="Students' work will appear here." />;
  return <ul className="grid gap-3">{q.data.map((s) => <ReviewRow key={s._id} sub={s} />)}</ul>;
}

function SubmitWork({ a, onClose }: { a: AssignmentRec; onClose: () => void }) {
  const save = useAction(
    (fd: FormData) => { fd.set("assignmentId", a._id); if (!(fd.get("file") as File)?.size) fd.delete("file"); return api("/submissions", { method: "POST", form: fd }); },
    { success: "Submitted — nice work", invalidate: ["my-submissions"], onDone: onClose },
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); }} className="grid gap-4">
      <Field label="Your answer">{(id) => <Textarea id={id} name="submissionText" className="min-h-32" />}</Field>
      <Field label="Attach a file">{(id) => <Input id={id} name="file" type="file" className="py-2.5 file:mr-3 file:rounded-lg file:border-0 file:bg-pine-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-pine-700" />}</Field>
      <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={save.isPending}><Send className="size-4" aria-hidden />Submit</Button></div>
    </form>
  );
}

export default function Assignments() {
  const { user } = useAuth();
  const student = user?.role === "student";
  const q = useQuery({ queryKey: ["assignments", user?.role], queryFn: async () => (await api<{ assignments: AssignmentRec[] }>(student ? "/assignments/student" : "/assignments")).assignments });
  const mine = useQuery({ queryKey: ["my-submissions"], enabled: student, queryFn: async () => (await api<{ submissions: SubmissionRec[] }>("/submissions/my-submissions")).submissions });

  const [create, setCreate] = useState(false);
  const [view, setView] = useState<AssignmentRec | null>(null);
  const [submit, setSubmit] = useState<AssignmentRec | null>(null);
  const [del, setDel] = useState<AssignmentRec | null>(null);
  const remove = useAction((id: string) => api(`/assignments/${id}`, { method: "DELETE" }), { success: "Assignment deleted", invalidate: ["assignments"], onDone: () => setDel(null) });
  const submission = (a: AssignmentRec) => mine.data?.find((s) => idOf(s.assignment) === a._id);

  return (
    <>
      <PageHeader eyebrow={student ? "Learning" : "Classroom"} title="Assignments" description={student ? "What's due, and what you've handed in." : "Post work, collect submissions and give feedback."}
        actions={!student && <Button onClick={() => setCreate(true)}><Plus className="size-4" aria-hidden />New assignment</Button>} />
      {q.error ? <ErrorState message={q.error.message} onRetry={() => q.refetch()} /> : q.isLoading ? <Card><TableSkeleton /></Card> :
        !q.data?.length ? <Card><Empty icon={FileText} title="No assignments" body={student ? "Nothing has been set for your class yet." : "Post your first assignment to get started."} /></Card> : (
          <ul className="grid gap-4 md:grid-cols-2">
            {q.data.map((a, i) => {
              const sub = submission(a);
              return (
                <li key={a._id} style={{ "--i": i } as React.CSSProperties} className="stagger flex flex-col rounded-2xl bg-surface p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="text-xs font-medium uppercase tracking-wider text-brass-600">{nameOf(a.subject, "subjectName") ?? "Assignment"}</p><h3 className="mt-1 font-display text-2xl leading-tight">{a.title}</h3></div>
                    {student ? (sub ? <Badge tone={sub.status === "reviewed" ? "good" : "warn"}>{sub.status}</Badge> : isOverdue(a) ? <Badge tone="bad">Overdue</Badge> : <Badge>To do</Badge>)
                      : <RowActions label={a.title} onDelete={() => setDel(a)} />}
                  </div>
                  {a.description && <p className="mt-2 line-clamp-3 text-sm text-zinc-600">{a.description}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-3.5" aria-hidden />Due {fmtDate(a.dueDate)}</span>
                    {nameOf(a.class, "className") && <span>{nameOf(a.class, "className")}{nameOf(a.section, "sectionName") ? ` · ${nameOf(a.section, "sectionName")}` : ""}</span>}
                    {fileUrl(a.attachment) && <a href={fileUrl(a.attachment)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 font-medium text-pine-600 hover:underline"><Paperclip className="size-3.5" aria-hidden />Attachment</a>}
                  </div>
                  <div className="mt-auto flex justify-end pt-4">
                    {student ? (sub ? (
                      <p className="text-sm text-zinc-600">{sub.status === "reviewed" ? <><span className="font-semibold tabular-nums">{sub.marksAwarded ?? "—"}</span> marks{sub.teacherRemarks ? ` · “${sub.teacherRemarks}”` : ""}</> : `Submitted ${fmtDate(sub.submittedAt)}`}</p>
                    ) : <Button size="sm" onClick={() => setSubmit(a)}>Submit work</Button>)
                      : <Button size="sm" variant="secondary" onClick={() => setView(a)}>View submissions</Button>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      <Modal wide open={create} onOpenChange={setCreate} title="New assignment">{create && <CreateAssignment onClose={() => setCreate(false)} />}</Modal>
      <Modal wide open={!!view} onOpenChange={(o) => !o && setView(null)} title="Submissions" description={view?.title}>{view && <Submissions a={view} />}</Modal>
      <Modal open={!!submit} onOpenChange={(o) => !o && setSubmit(null)} title="Submit work" description={submit?.title}>{submit && <SubmitWork a={submit} onClose={() => setSubmit(null)} />}</Modal>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Delete assignment?" loading={remove.isPending} body={`“${del?.title}” will be removed for everyone.`} onConfirm={() => del && remove.mutate(del._id)} />
    </>
  );
}

export { toInputDate };
