import { Plus, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ConfirmDialog } from "@/components/confirm";
import { RowActions } from "@/components/row-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Avatar, PageHeader } from "@/components/ui/misc";
import { api } from "@/lib/api";
import { useAction } from "@/lib/mutate";
import { useTeachers } from "@/lib/queries";
import type { TeacherRec } from "@/lib/types";
import { fmtDate, toInputDate } from "@/lib/utils";

function TeacherForm({ teacher, onClose }: { teacher?: TeacherRec; onClose: () => void }) {
  const editing = !!teacher;
  const save = useAction(
    (fd: FormData) => {
      const v = Object.fromEntries(fd) as Record<string, string>;
      const body = {
        name: v.name, email: v.email, qualification: v.qualification,
        experience: v.experience ? Number(v.experience) : undefined,
        salary: v.salary ? Number(v.salary) : undefined,
        subjectSpecialization: v.spec, phone: v.phone, gender: v.gender || undefined,
        address: v.address, joiningDate: v.joiningDate || undefined,
        ...(editing ? {} : { password: v.password }),
      };
      return editing
        ? api(`/user-management/teacher/${teacher!._id}`, { method: "PUT", body })
        : api("/user-management/teacher", { method: "POST", body });
    },
    { success: editing ? "Teacher updated" : "Teacher added", invalidate: ["teachers"], onDone: onClose },
  );
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name">{(id) => <Input id={id} name="name" required defaultValue={teacher?.user.name} />}</Field>
      <Field label="Email">{(id) => <Input id={id} name="email" type="email" required defaultValue={teacher?.user.email} />}</Field>
      {!editing && <Field label="Initial password" hint="At least 6 characters" className="sm:col-span-2">{(id) => <Input id={id} name="password" type="password" minLength={6} required autoComplete="new-password" />}</Field>}
      <Field label="Qualification">{(id) => <Input id={id} name="qualification" defaultValue={teacher?.qualification} placeholder="M.Sc. Mathematics" />}</Field>
      <Field label="Specialization">{(id) => <Input id={id} name="spec" defaultValue={teacher?.subjectsSpecialization ?? teacher?.subjectSpecialization} />}</Field>
      <Field label="Experience (years)">{(id) => <Input id={id} name="experience" type="number" min={0} defaultValue={teacher?.experience} />}</Field>
      <Field label="Salary">{(id) => <Input id={id} name="salary" type="number" min={0} defaultValue={teacher?.salary} />}</Field>
      <Field label="Phone">{(id) => <Input id={id} name="phone" type="tel" defaultValue={teacher?.phone} />}</Field>
      <Field label="Gender">{(id) => (
        <Select id={id} name="gender" defaultValue={teacher?.gender ?? ""}><option value="">—</option><option value="male">Male</option><option value="female">Female</option></Select>
      )}</Field>
      <Field label="Joining date" className="sm:col-span-2">{(id) => <Input id={id} name="joiningDate" type="date" defaultValue={toInputDate(teacher?.joiningDate)} />}</Field>
      <Field label="Address" className="sm:col-span-2">{(id) => <Textarea id={id} name="address" defaultValue={teacher?.address} />}</Field>
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={save.isPending}>{editing ? "Save changes" : "Add teacher"}</Button>
      </div>
    </form>
  );
}

export default function Teachers() {
  const q = useTeachers();
  const [form, setForm] = useState<{ teacher?: TeacherRec } | null>(null);
  const [del, setDel] = useState<TeacherRec | null>(null);
  const remove = useAction((id: string) => api(`/user-management/teacher/${id}`, { method: "DELETE" }), {
    success: "Teacher removed", invalidate: ["teachers"], onDone: () => setDel(null),
  });

  const columns: Column<TeacherRec>[] = [
    { header: "Teacher", cell: (t) => (
      <div className="flex items-center gap-3">
        <Avatar name={t.user?.name} src={t.user?.avatar?.url} />
        <div className="min-w-0 max-w-[5.75rem] sm:max-w-none"><p className="truncate font-medium">{t.user?.name}</p><p className="truncate text-xs text-zinc-500">{t.user?.email}</p></div>
      </div>
    ) },
    { header: "Qualification", hideOnMobile: true, cell: (t) => t.qualification || "—" },
    { header: "Experience", hideOnMobile: true, cell: (t) => (t.experience != null ? `${t.experience} yr` : "—") },
    { header: "Phone", hideOnMobile: true, cell: (t) => t.phone || "—" },
    { header: "Joined", hideOnMobile: true, cell: (t) => fmtDate(t.joiningDate) },
    { header: "", align: "right", cell: (t) => <RowActions label={t.user?.name} onEdit={() => setForm({ teacher: t })} onDelete={() => setDel(t)} /> },
  ];

  return (
    <>
      <PageHeader eyebrow="People" title="Teachers" description="Your teaching staff, their credentials and contact details."
        actions={<Button onClick={() => setForm({})}><Plus className="size-4" aria-hidden />Add teacher</Button>} />
      <Card>
        <DataTable rows={q.data} columns={columns} rowKey={(t) => t._id} loading={q.isLoading}
          error={q.error?.message} onRetry={() => q.refetch()}
          searchText={(t) => `${t.user?.name} ${t.user?.email} ${t.qualification ?? ""}`}
          empty={{ title: "No teachers yet", body: "Add a teacher so you can assign subjects and timetable slots.", action: <Button onClick={() => setForm({})}><Users className="size-4" aria-hidden />Add teacher</Button> }} />
      </Card>
      <Modal wide open={!!form} onOpenChange={(o) => !o && setForm(null)} title={form?.teacher ? "Edit teacher" : "Add teacher"} description="Creates a login and a teacher profile.">
        {form && <TeacherForm teacher={form.teacher} onClose={() => setForm(null)} />}
      </Modal>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Remove teacher?" loading={remove.isPending}
        body={`${del?.user?.name} and their login will be permanently deleted.`} onConfirm={() => del && remove.mutate(del._id)} />
    </>
  );
}
