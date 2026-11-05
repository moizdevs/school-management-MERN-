import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/confirm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/misc";
import { Empty, ErrorState, TableSkeleton } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/mutate";
import { idOf, useClasses, useSections, useSubjects } from "@/lib/queries";
import { DAYS, type TimetableRec } from "@/lib/types";
import { cn } from "@/lib/utils";

const period = (t: TimetableRec) => t.periodNumber ?? t.peroidNumber ?? 0;

function Grid({ slots, onDelete, showClass }: { slots: TimetableRec[]; onDelete?: (t: TimetableRec) => void; showClass?: boolean }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {DAYS.map((d, di) => {
        const items = slots.filter((s) => s.day === d).sort((a, b) => period(a) - period(b));
        return (
          <section key={d} aria-labelledby={`d-${d}`} style={{ "--i": di } as React.CSSProperties}
            className={cn("stagger rounded-2xl p-4 shadow-card", d === today ? "bg-pine-900 text-white shadow-press" : "bg-surface")}>
            <h3 id={`d-${d}`} className="mb-3 flex items-center justify-between font-display text-2xl">{d}{d === today && <span className="rounded-full bg-brass-400 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-pine-950">Today</span>}</h3>
            {!items.length ? <p className={cn("py-4 text-sm", d === today ? "text-pine-100/60" : "text-zinc-400")}>No classes</p> : (
              <ol className="space-y-2">
                {items.map((s) => (
                  <li key={s._id} className={cn("flex items-center gap-3 rounded-xl p-3", d === today ? "bg-white/10" : "bg-white shadow-[0_0_0_1px_rgb(20_23_26/0.06)]")}>
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg text-sm font-semibold tabular-nums", d === today ? "bg-brass-400 text-pine-950" : "bg-pine-50 text-pine-700")}>{period(s)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.subject?.subjectName ?? "Subject"}</p>
                      <p className={cn("truncate text-xs tabular-nums", d === today ? "text-pine-100/70" : "text-zinc-500")}>
                        {s.startTime}–{s.endTime}{s.teacher?.user?.name ? ` · ${s.teacher.user.name}` : ""}{showClass && typeof s.class === "object" ? ` · ${s.class?.className}${typeof s.section === "object" ? " " + s.section?.sectionName : ""}` : ""}
                      </p>
                    </div>
                    {onDelete && <button onClick={() => onDelete(s)} aria-label={`Delete period ${period(s)} on ${d}`} className="grid size-11 place-items-center rounded-xl text-zinc-400 outline-none transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-pine-500"><Trash2 className="size-4" /></button>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}

function AddSlot({ classId, sectionId, onClose }: { classId: string; sectionId: string; onClose: () => void }) {
  const subjects = useSubjects();
  const save = useAction(
    (fd: FormData) => {
      const v = Object.fromEntries(fd) as Record<string, string>;
      return api("/timetable", { method: "POST", body: { classId, sectionId, day: v.day, periodNumber: Number(v.periodNumber), startTime: v.startTime, endTime: v.endTime, subjectId: v.subjectId } });
    },
    { success: "Slot added", invalidate: ["timetable"], onDone: onClose },
  );
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); };
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Day">{(id) => <Select id={id} name="day" required defaultValue="Monday">{DAYS.map((d) => <option key={d}>{d}</option>)}</Select>}</Field>
      <Field label="Period">{(id) => <Input id={id} name="periodNumber" type="number" min={1} required defaultValue={1} />}</Field>
      <Field label="Starts">{(id) => <Input id={id} name="startTime" type="time" required defaultValue="08:00" />}</Field>
      <Field label="Ends">{(id) => <Input id={id} name="endTime" type="time" required defaultValue="08:45" />}</Field>
      <Field label="Subject" hint="The subject's assigned teacher takes the slot." className="sm:col-span-2">{(id) => (
        <Select id={id} name="subjectId" required defaultValue="">
          <option value="" disabled>Select subject</option>
          {subjects.data?.filter((s) => idOf(s.class) === classId).map((s) => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
        </Select>
      )}</Field>
      <div className="mt-2 flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" loading={save.isPending}>Add slot</Button></div>
    </form>
  );
}

function AdminView() {
  const classes = useClasses();
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const sections = useSections(classId || undefined);
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<TimetableRec | null>(null);
  const q = useQuery({ queryKey: ["timetable", classId, sectionId], enabled: !!(classId && sectionId), queryFn: async () => (await api<{ timetable: TimetableRec[] }>(`/timetable/class/${classId}/${sectionId}`)).timetable });
  const remove = useAction((id: string) => api(`/timetable/${id}`, { method: "DELETE" }), { success: "Slot removed", invalidate: ["timetable"], onDone: () => setDel(null) });

  return (
    <>
      <PageHeader eyebrow="Academics" title="Timetable" description="Plan each section's week, period by period."
        actions={<Button disabled={!sectionId} onClick={() => setAdding(true)}><Plus className="size-4" aria-hidden />Add slot</Button>} />
      <Card className="mb-6"><Card.Content className="grid gap-4 sm:max-w-xl sm:grid-cols-2">
        <Field label="Class">{(id) => <Select id={id} value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}><option value="">Select class</option>{classes.data?.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}</Select>}</Field>
        <Field label="Section">{(id) => <Select id={id} value={sectionId} disabled={!classId} onChange={(e) => setSectionId(e.target.value)}><option value="">Select section</option>{sections.data?.map((s) => <option key={s._id} value={s._id}>{s.sectionName}</option>)}</Select>}</Field>
      </Card.Content></Card>
      {!sectionId ? <Card><Empty icon={CalendarClock} title="Choose a class and section" /></Card> :
        q.error ? <ErrorState message={q.error.message} onRetry={() => q.refetch()} /> : q.isLoading ? <Card><TableSkeleton /></Card> :
        <Grid slots={q.data ?? []} onDelete={setDel} />}
      <Modal wide open={adding} onOpenChange={setAdding} title="Add timetable slot">{adding && <AddSlot classId={classId} sectionId={sectionId} onClose={() => setAdding(false)} />}</Modal>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Remove slot?" body="This period will be removed from the timetable." confirmLabel="Remove" loading={remove.isPending} onConfirm={() => del && remove.mutate(del._id)} />
    </>
  );
}

export default function Timetable() {
  const { user } = useAuth();
  const role = user?.role;
  const q = useQuery({ queryKey: ["timetable", role], enabled: role !== "admin", queryFn: async () => (await api<{ timetable: TimetableRec[] }>(`/timetable/${role}`)).timetable });
  if (role === "admin") return <AdminView />;
  return (
    <>
      <PageHeader eyebrow={role === "teacher" ? "Teaching" : "Learning"} title={role === "teacher" ? "My timetable" : "Timetable"} description="Your week at a glance — today is highlighted." />
      {q.error ? <ErrorState message={q.error.message} onRetry={() => q.refetch()} /> : q.isLoading ? <Card><TableSkeleton /></Card> :
        !q.data?.length ? <Card><Empty icon={CalendarClock} title="No timetable yet" body="Once the school publishes one, it'll appear here." /></Card> :
        <Grid slots={q.data} showClass={role === "teacher"} />}
    </>
  );
}
