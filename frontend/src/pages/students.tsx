import { GraduationCap, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ConfirmDialog } from "@/components/confirm";
import { RowActions } from "@/components/row-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Avatar, PageHeader } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { useAction } from "@/lib/mutate";
import { idOf, useClasses, useSections, useStudents } from "@/lib/queries";
import type { StudentRec } from "@/lib/types";
import { fmtDate, toInputDate } from "@/lib/utils";

function StudentForm({ student, onClose }: { student?: StudentRec; onClose: () => void }) {
  const classes = useClasses();
  const [classId, setClassId] = useState(idOf(student?.class) ?? "");
  const sections = useSections(classId || undefined);
  const editing = !!student;

  const save = useAction(
    (fd: FormData) => {
      const v = Object.fromEntries(fd) as Record<string, string>;
      const sectionId = v.sectionId || undefined;
      if (editing) {
        // Update passes the body straight to the profile, so field names are `class`/`section`.
        return api(`/user-management/student/${student!._id}`, {
          method: "PUT",
          body: { name: v.name, email: v.email, class: classId || undefined, section: sectionId, rollNumber: v.rollNumber, fatherName: v.fatherName, motherName: v.motherName, phone: v.phone, gender: v.gender || undefined, dob: v.dob || undefined, address: v.address },
        });
      }
      return api("/user-management/student", {
        method: "POST",
        body: { name: v.name, email: v.email, password: v.password, classId: classId || undefined, sectionId, rollNumber: v.rollNumber, fatherName: v.fatherName, motherName: v.motherName, phone: v.phone, gender: v.gender || undefined, dob: v.dob || undefined, address: v.address },
      });
    },
    { success: editing ? "Student updated" : "Student enrolled", invalidate: ["students"], onDone: onClose },
  );

  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name">{(id) => <Input id={id} name="name" required defaultValue={student?.user.name} />}</Field>
      <Field label="Email">{(id) => <Input id={id} name="email" type="email" required defaultValue={student?.user.email} />}</Field>
      {!editing && <Field label="Initial password" hint="At least 6 characters" className="sm:col-span-2">{(id) => <Input id={id} name="password" type="password" minLength={6} required autoComplete="new-password" />}</Field>}
      <Field label="Class">{(id) => (
        <Select id={id} value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select class</option>
          {classes.data?.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
        </Select>
      )}</Field>
      <Field label="Section">{(id) => (
        <Select id={id} name="sectionId" key={classId} defaultValue={idOf(student?.section) ?? ""} disabled={!classId}>
          <option value="">Select section</option>
          {sections.data?.map((s) => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
        </Select>
      )}</Field>
      <Field label="Roll number">{(id) => <Input id={id} name="rollNumber" defaultValue={student?.rollNumber} />}</Field>
      <Field label="Gender">{(id) => (
        <Select id={id} name="gender" defaultValue={student?.gender ?? ""}>
          <option value="">—</option><option value="male">Male</option><option value="female">Female</option>
        </Select>
      )}</Field>
      <Field label="Father's name">{(id) => <Input id={id} name="fatherName" defaultValue={student?.fatherName} />}</Field>
      <Field label="Mother's name">{(id) => <Input id={id} name="motherName" defaultValue={student?.motherName} />}</Field>
      <Field label="Phone">{(id) => <Input id={id} name="phone" type="tel" defaultValue={student?.phone} />}</Field>
      <Field label="Date of birth">{(id) => <Input id={id} name="dob" type="date" defaultValue={toInputDate(student?.dob)} />}</Field>
      <Field label="Address" className="sm:col-span-2">{(id) => <Textarea id={id} name="address" defaultValue={student?.address} />}</Field>
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{editing ? "Save changes" : "Enroll student"}</Button>
      </div>
    </form>
  );
}

export default function Students() {
  const q = useStudents();
  const [form, setForm] = useState<{ student?: StudentRec } | null>(null);
  const [del, setDel] = useState<StudentRec | null>(null);
  const remove = useAction((id: string) => api(`/user-management/student/${id}`, { method: "DELETE" }), {
    success: "Student removed", invalidate: ["students"], onDone: () => setDel(null),
  });

  const columns: Column<StudentRec>[] = [
    { header: "Student", cell: (s) => (
      <div className="flex items-center gap-3">
        <Avatar name={s.user?.name} src={s.user?.avatar?.url} />
        <div className="min-w-0 max-w-[5.75rem] sm:max-w-none"><p className="truncate font-medium">{s.user?.name}</p><p className="truncate text-xs text-zinc-500">{s.user?.email}</p></div>
      </div>
    ) },
    { header: "Class", cell: (s) => s.class ? <Badge tone="good">{s.class.className}{s.section ? ` · ${s.section.sectionName}` : ""}</Badge> : <span className="text-zinc-400">—</span> },
    { header: "Roll", hideOnMobile: true, cell: (s) => s.rollNumber ?? "—" },
    { header: "Guardian", hideOnMobile: true, cell: (s) => s.fatherName || s.motherName || "—" },
    { header: "Admitted", hideOnMobile: true, cell: (s) => fmtDate(s.admissionDate) },
    { header: "", align: "right", cell: (s) => <RowActions label={s.user?.name} onEdit={() => setForm({ student: s })} onDelete={() => setDel(s)} /> },
  ];

  return (
    <>
      <PageHeader eyebrow="People" title="Students" description="Enroll, update and manage every student's profile and placement."
        actions={<Button onClick={() => setForm({})}><Plus className="size-4" aria-hidden />Enroll student</Button>} />
      <Card>
        <DataTable rows={q.data} columns={columns} rowKey={(s) => s._id} loading={q.isLoading}
          error={q.error?.message} onRetry={() => q.refetch()}
          searchText={(s) => `${s.user?.name} ${s.user?.email} ${s.rollNumber ?? ""} ${s.class?.className ?? ""}`}
          empty={{ title: "No students yet", body: "Enroll your first student to get started.", action: <Button onClick={() => setForm({})}><GraduationCap className="size-4" aria-hidden />Enroll student</Button> }} />
      </Card>
      <Modal wide open={!!form} onOpenChange={(o) => !o && setForm(null)} title={form?.student ? "Edit student" : "Enroll student"} description="Creates a login and a student profile.">
        {form && <StudentForm student={form.student} onClose={() => setForm(null)} />}
      </Modal>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Remove student?" loading={remove.isPending}
        body={`${del?.user?.name} and their login will be permanently deleted.`} onConfirm={() => del && remove.mutate(del._id)} />
    </>
  );
}
