import { BookOpen, Plus } from "lucide-react";
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
import { useAction } from "@/lib/mutate";
import { idOf, useClasses, useSubjects, useTeachers } from "@/lib/queries";
import type { ClassRec, SubjectRec, TeacherRec } from "@/lib/types";

function SubjectForm({ subject, onClose }: { subject?: SubjectRec; onClose: () => void }) {
  const classes = useClasses();
  const teachers = useTeachers();
  const editing = !!subject;
  const save = useAction(
    (fd: FormData) => {
      const v = Object.fromEntries(fd) as Record<string, string>;
      return editing
        // Update writes the body straight onto the document: `class` / `teacher`.
        ? api(`/subject/${subject!._id}`, { method: "PUT", body: { subjectName: v.subjectName, subjectCode: v.subjectCode, class: v.classId, teacher: v.teacherId || undefined, description: v.description } })
        : api("/subject/create", { method: "POST", body: { subjectName: v.subjectName, subjectCode: v.subjectCode, classId: v.classId, teacherId: v.teacherId || undefined, description: v.description } });
    },
    { success: editing ? "Subject updated" : "Subject created", invalidate: ["subjects"], onDone: onClose },
  );
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Subject name">{(id) => <Input id={id} name="subjectName" required defaultValue={subject?.subjectName} />}</Field>
      <Field label="Code" hint="Must be unique">{(id) => <Input id={id} name="subjectCode" required defaultValue={subject?.subjectCode} placeholder="MATH-101" />}</Field>
      <Field label="Class">{(id) => (
        <Select id={id} name="classId" required defaultValue={idOf(subject?.class) ?? ""}>
          <option value="" disabled>Select class</option>
          {classes.data?.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
        </Select>
      )}</Field>
      <Field label="Teacher">{(id) => (
        <Select id={id} name="teacherId" defaultValue={idOf(subject?.teacher) ?? ""}>
          <option value="">Unassigned</option>
          {teachers.data?.map((t) => <option key={t._id} value={t._id}>{t.user?.name}</option>)}
        </Select>
      )}</Field>
      <Field label="Description" className="sm:col-span-2">{(id) => <Textarea id={id} name="description" defaultValue={subject?.description} />}</Field>
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{editing ? "Save changes" : "Create subject"}</Button>
      </div>
    </form>
  );
}

export default function Subjects() {
  const q = useSubjects();
  const classes = useClasses();
  const teachers = useTeachers();
  const [form, setForm] = useState<{ subject?: SubjectRec } | null>(null);
  const [del, setDel] = useState<SubjectRec | null>(null);
  const remove = useAction((id: string) => api(`/subject/${id}`, { method: "DELETE" }), { success: "Subject deleted", invalidate: ["subjects"], onDone: () => setDel(null) });

  // The list endpoint may return unpopulated ids; resolve names from the other lists.
  const className = (s: SubjectRec) => typeof s.class === "string" ? classes.data?.find((c: ClassRec) => c._id === s.class)?.className : s.class?.className;
  const teacherName = (s: SubjectRec) => {
    if (!s.teacher) return undefined;
    const t = typeof s.teacher === "string" ? teachers.data?.find((x: TeacherRec) => x._id === s.teacher) : s.teacher;
    return t?.user?.name;
  };

  const columns: Column<SubjectRec>[] = [
    { header: "Subject", cell: (s) => <div><p className="font-medium">{s.subjectName}</p><p className="text-xs text-zinc-500">{s.subjectCode}</p></div> },
    { header: "Class", cell: (s) => className(s) ? <Badge tone="good">{className(s)}</Badge> : "—" },
    { header: "Teacher", hideOnMobile: true, cell: (s) => teacherName(s) ?? <span className="text-zinc-400">Unassigned</span> },
    { header: "", align: "right", cell: (s) => <RowActions label={s.subjectName} onEdit={() => setForm({ subject: s })} onDelete={() => setDel(s)} /> },
  ];

  return (
    <>
      <PageHeader eyebrow="Academics" title="Subjects" description="What's taught, to which class, and by whom."
        actions={<Button onClick={() => setForm({})}><Plus className="size-4" aria-hidden />New subject</Button>} />
      <Card>
        <DataTable rows={q.data} columns={columns} rowKey={(s) => s._id} loading={q.isLoading} error={q.error?.message} onRetry={() => q.refetch()}
          searchText={(s) => `${s.subjectName} ${s.subjectCode}`}
          empty={{ title: "No subjects yet", body: "Create subjects, then use them in the timetable and exams.", action: <Button onClick={() => setForm({})}><BookOpen className="size-4" aria-hidden />New subject</Button> }} />
      </Card>
      <Modal wide open={!!form} onOpenChange={(o) => !o && setForm(null)} title={form?.subject ? "Edit subject" : "New subject"}>
        {form && <SubjectForm subject={form.subject} onClose={() => setForm(null)} />}
      </Modal>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Delete subject?" loading={remove.isPending}
        body={`${del?.subjectName} will be permanently removed.`} onConfirm={() => del && remove.mutate(del._id)} />
    </>
  );
}
