import { ClipboardList, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ConfirmDialog } from "@/components/confirm";
import { RowActions } from "@/components/row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/mutate";
import { useClasses, useExams, useSections, useSubjects } from "@/lib/queries";
import type { ExamRec } from "@/lib/types";
import { fmtDate } from "@/lib/utils";

function ExamForm({ onClose }: { onClose: () => void }) {
  const classes = useClasses();
  const subjects = useSubjects();
  const [classId, setClassId] = useState("");
  const sections = useSections(classId || undefined);
  const save = useAction(
    (fd: FormData) => {
      const v = Object.fromEntries(fd) as Record<string, string>;
      return api("/exams", { method: "POST", body: { examName: v.examName, classId, sectionId: v.sectionId, subjectId: v.subjectId, examDate: v.examDate, totalMarks: Number(v.totalMarks), passingMarks: Number(v.passingMarks), description: v.description } });
    },
    { success: "Exam scheduled", invalidate: ["exams"], onDone: onClose },
  );
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); };
  const classSubjects = subjects.data?.filter((s) => (typeof s.class === "string" ? s.class : s.class?._id) === classId);

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Exam name" className="sm:col-span-2">{(id) => <Input id={id} name="examName" required placeholder="Mid-term 2026" />}</Field>
      <Field label="Class">{(id) => (
        <Select id={id} required value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="" disabled>Select class</option>
          {classes.data?.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
        </Select>
      )}</Field>
      <Field label="Section">{(id) => (
        <Select id={id} name="sectionId" required disabled={!classId} key={classId} defaultValue="">
          <option value="" disabled>Select section</option>
          {sections.data?.map((s) => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
        </Select>
      )}</Field>
      <Field label="Subject">{(id) => (
        <Select id={id} name="subjectId" required disabled={!classId} key={`s${classId}`} defaultValue="">
          <option value="" disabled>Select subject</option>
          {classSubjects?.map((s) => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
        </Select>
      )}</Field>
      <Field label="Date">{(id) => <Input id={id} name="examDate" type="date" required />}</Field>
      <Field label="Total marks">{(id) => <Input id={id} name="totalMarks" type="number" min={1} required />}</Field>
      <Field label="Passing marks">{(id) => <Input id={id} name="passingMarks" type="number" min={0} required />}</Field>
      <Field label="Notes" className="sm:col-span-2">{(id) => <Textarea id={id} name="description" />}</Field>
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>Schedule exam</Button>
      </div>
    </form>
  );
}

export default function Exams() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const q = useExams();
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState<ExamRec | null>(null);
  const remove = useAction((id: string) => api(`/exams/${id}`, { method: "DELETE" }), { success: "Exam deleted", invalidate: ["exams"], onDone: () => setDel(null) });

  const columns: Column<ExamRec>[] = [
    { header: "Exam", cell: (e) => <div><p className="font-medium">{e.examName}</p><p className="text-xs text-zinc-500">{e.subject?.subjectName}</p></div> },
    { header: "Class", cell: (e) => <Badge tone="good">{e.class?.className}{e.section ? ` · ${e.section.sectionName}` : ""}</Badge> },
    { header: "Date", cell: (e) => fmtDate(e.examDate) },
    { header: "Marks", hideOnMobile: true, cell: (e) => <span>{e.totalMarks} <span className="text-zinc-400">· pass {e.passingMarks}</span></span> },
    ...(isAdmin ? [{ header: "", align: "right" as const, cell: (e: ExamRec) => <RowActions label={e.examName} onDelete={() => setDel(e)} /> }] : []),
  ];

  return (
    <>
      <PageHeader eyebrow="Academics" title="Exams" description="Upcoming and past assessments across every class."
        actions={isAdmin && <Button onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden />Schedule exam</Button>} />
      <Card>
        <DataTable rows={q.data} columns={columns} rowKey={(e) => e._id} loading={q.isLoading} error={q.error?.message} onRetry={() => q.refetch()}
          searchText={(e) => `${e.examName} ${e.subject?.subjectName ?? ""} ${e.class?.className ?? ""}`}
          empty={{ title: "No exams scheduled", body: isAdmin ? "Schedule an exam to start recording results." : "Nothing has been scheduled yet.", action: isAdmin ? <Button onClick={() => setOpen(true)}><ClipboardList className="size-4" aria-hidden />Schedule exam</Button> : undefined }} />
      </Card>
      <Modal wide open={open} onOpenChange={setOpen} title="Schedule exam">{open && <ExamForm onClose={() => setOpen(false)} />}</Modal>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Delete exam?" loading={remove.isPending}
        body={`${del?.examName} will be permanently removed.`} onConfirm={() => del && remove.mutate(del._id)} />
    </>
  );
}
