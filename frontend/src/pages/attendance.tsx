import { CalendarCheck2, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Tabs from "@radix-ui/react-tabs";
import { NeedProfile } from "@/components/need-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input, Field, Select } from "@/components/ui/field";
import { PageHeader, Stat } from "@/components/ui/misc";
import { Empty } from "@/components/ui/states";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/mutate";
import { idOf, useClasses, useMyProfileId, useSections, useStudents, useSubjects } from "@/lib/queries";
import type { AttendanceRec, AttendanceStatus } from "@/lib/types";
import { cn, fmtDate } from "@/lib/utils";

const STATUS: { v: AttendanceStatus; label: string; on: string }[] = [
  { v: "present", label: "Present", on: "bg-pine-900 text-white shadow-press" },
  { v: "absent", label: "Absent", on: "bg-red-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]" },
  { v: "leave", label: "Leave", on: "bg-brass-400 text-pine-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.4)]" },
];
const tone = { present: "good", absent: "bad", leave: "warn" } as const;

function ClassPicker({ classId, setClassId, sectionId, setSectionId, children }: {
  classId: string; setClassId: (v: string) => void; sectionId: string; setSectionId: (v: string) => void; children?: React.ReactNode;
}) {
  const classes = useClasses();
  const sections = useSections(classId || undefined);
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label="Class">{(id) => (
        <Select id={id} value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}>
          <option value="">Select class</option>{classes.data?.map((c) => <option key={c._id} value={c._id}>{c.className}</option>)}
        </Select>
      )}</Field>
      <Field label="Section">{(id) => (
        <Select id={id} value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
          <option value="">Select section</option>{sections.data?.map((s) => <option key={s._id} value={s._id}>{s.sectionName}</option>)}
        </Select>
      )}</Field>
      {children}
    </div>
  );
}

function MarkAttendance() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const students = useStudents();
  const subjects = useSubjects();

  const roster = useMemo(
    () => students.data?.filter((s) => idOf(s.class) === classId && idOf(s.section) === sectionId) ?? [],
    [students.data, classId, sectionId],
  );
  const classSubjects = subjects.data?.filter((s) => idOf(s.class) === classId);
  const statusOf = (id: string) => marks[id] ?? "present";

  const save = useAction(
    () => api("/attendance/mark", { method: "POST", body: { classId, sectionId, subjectId, attendanceData: roster.map((s) => ({ studentId: s._id, status: statusOf(s._id) })) } }),
    { success: "Attendance saved", invalidate: ["attendance"], onDone: () => setMarks({}) },
  );
  const setAll = (v: AttendanceStatus) => setMarks(Object.fromEntries(roster.map((s) => [s._id, v])));
  const counts = roster.reduce((a, s) => ({ ...a, [statusOf(s._id)]: (a[statusOf(s._id)] ?? 0) + 1 }), {} as Record<string, number>);

  return (
    <Card>
      <Card.Content className="border-b border-zinc-900/5">
        <ClassPicker {...{ classId, setClassId, sectionId, setSectionId }}>
          <Field label="Subject">{(id) => (
            <Select id={id} value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!classId}>
              <option value="">Select subject</option>{classSubjects?.map((s) => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
            </Select>
          )}</Field>
        </ClassPicker>
        {!students.isLoading && !students.data?.length && <p className="mt-4 text-sm text-amber-700">Your account can't list students yet — see BACKEND_NOTES.md.</p>}
      </Card.Content>
      {!(classId && sectionId && subjectId) ? (
        <Empty icon={CalendarCheck2} title="Choose a class, section and subject" body="Then mark each student for today." />
      ) : !roster.length ? (
        <Empty title="No students in this section" />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
            <p className="text-sm tabular-nums text-zinc-500">{counts.present ?? 0} present · {counts.absent ?? 0} absent · {counts.leave ?? 0} leave</p>
            <Button size="sm" variant="secondary" onClick={() => setAll("present")}><Check className="size-4" aria-hidden />All present</Button>
          </div>
          <ul className="divide-y divide-zinc-900/5 border-t border-zinc-900/5">
            {roster.map((s, i) => (
              <li key={s._id} style={{ "--i": Math.min(i, 12) } as React.CSSProperties} className="stagger flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 sm:px-6">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{s.user?.name}</p><p className="text-xs text-zinc-500">Roll {s.rollNumber ?? "—"}</p></div>
                <div role="radiogroup" aria-label={`Status for ${s.user?.name}`} className="flex gap-1 rounded-2xl bg-zinc-900/5 p-1">
                  {STATUS.map((o) => (
                    <button key={o.v} role="radio" aria-checked={statusOf(s._id) === o.v} onClick={() => setMarks((m) => ({ ...m, [s._id]: o.v }))}
                      className={cn("min-h-11 min-w-[72px] rounded-xl px-3 text-[13px] font-medium outline-none transition-[background,color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-pine-500 motion-reduce:transition-none",
                        statusOf(s._id) === o.v ? o.on : "text-zinc-600 hover:text-ink")}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <div className="flex justify-end border-t border-zinc-900/5 p-4 sm:px-6"><Button loading={save.isPending} onClick={() => save.mutate(undefined)}>Save attendance</Button></div>
        </>
      )}
    </Card>
  );
}

function ClassRecords() {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  // Aaj ki local date "YYYY-MM-DD" format mein (en-CA ka format yahi hai)
  const [date, setDate] = useState(() => new Date().toLocaleDateString("en-CA"));

  const ready = !!(classId && sectionId && date);

  const q = useQuery({
    queryKey: ["attendance", "class", classId, sectionId, date],
    enabled: ready,   // teeno hon tabhi request jayegi
    queryFn: async () => {
      const params = new URLSearchParams({ sectionId, date });
      const res = await api<{ attendance: AttendanceRec[] }>(
        `/attendance/class/${classId}?${params.toString()}`,
      );
      return res.attendance;
    },
  });

  const columns: Column<AttendanceRec>[] = [
    { header: "Date", cell: (a) => fmtDate(a.attendanceDate) },
    { header: "Student", cell: (a) => (typeof a.student === "string" ? a.student : a.student?.user?.name) ?? "—" },
    { header: "Subject", hideOnMobile: true, cell: (a) => a.subject?.subjectName ?? "—" },
    { header: "Status", cell: (a) => <Badge tone={tone[a.status]}>{a.status}</Badge> },
  ];

  return (
    <Card>
      <Card.Content className="border-b border-zinc-900/5">
        <ClassPicker {...{ classId, setClassId, sectionId, setSectionId }}>
          <Field label="Date">
            {(id) => <Input id={id} type="date" required value={date} onChange={(e) => setDate(e.target.value)} />}
          </Field>
        </ClassPicker>
      </Card.Content>
      {!ready ? (
        <Empty icon={CalendarCheck2} title="Choose class, section and date" body="Then you'll see that day's attendance." />
      ) : (
        <DataTable
          rows={q.data}
          columns={columns}
          rowKey={(a) => a._id}
          loading={q.isLoading}
          error={q.error?.message}
          onRetry={() => q.refetch()}
          searchText={(a) => `${typeof a.student === "string" ? "" : a.student?.user?.name} ${a.subject?.subjectName}`}
          empty={{ title: "No records for this date" }}
        />
      )}
    </Card>
  );
}

function MyAttendance({ id }: { id: string }) {
  const stats = useQuery({ queryKey: ["attendance", "stats", id], queryFn: () => api<{ totalAttendance: number; presentAttendance: number; abesentAttendance: number; percentage: string | null }>(`/attendance/stats/${id}`) });
  const list = useQuery({ queryKey: ["attendance", "student", id], queryFn: async () => (await api<{ attendance: AttendanceRec[] }>(`/attendance/student/${id}`)).attendance });
  const s = stats.data;
  const p = s && s.percentage != null && !Number.isNaN(Number(s.percentage)) ? Number(s.percentage) : 0;
  const columns: Column<AttendanceRec>[] = [
    { header: "Date", cell: (a) => fmtDate(a.attendanceDate) },
    { header: "Subject", cell: (a) => a.subject?.subjectName ?? "—" },
    { header: "Status", cell: (a) => <Badge tone={tone[a.status]}>{a.status}</Badge> },
    { header: "Remarks", hideOnMobile: true, cell: (a) => a.remarks || "—" },
  ];
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat tone="dark" i={0} label="Attendance rate" value={`${p}%`} />
        <Stat i={1} label="Days present" value={s?.presentAttendance ?? 0} hint={`of ${s?.totalAttendance ?? 0} recorded`} />
        <Stat i={2} label="Days absent" value={s?.abesentAttendance ?? 0} />
      </div>
      <Card><DataTable rows={list.data} columns={columns} rowKey={(a) => a._id} loading={list.isLoading} error={list.error?.message} empty={{ title: "No attendance recorded yet" }} /></Card>
    </div>
  );
}

export default function Attendance() {
  const { user } = useAuth();
  const myId = useMyProfileId();

  if (user?.role === "student")
    return (<><PageHeader eyebrow="My progress" title="Attendance" description="How often you've been in class." />{myId ? <MyAttendance id={myId} /> : <Card><NeedProfile /></Card>}</>);

  const tabs = user?.role === "teacher" ? ["mark", "records"] : ["records"];
  const tabCls = "min-h-11 rounded-xl px-4 text-sm font-medium text-zinc-600 outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-pine-500 data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-card";
  return (
    <>
      <PageHeader eyebrow="Classroom" title="Attendance" description={user?.role === "teacher" ? "Take attendance for your class, or review what's been recorded." : "Review attendance records by class."} />
      <Tabs.Root defaultValue={tabs[0]}>
        {tabs.length > 1 && (
          <Tabs.List className="mb-5 inline-flex gap-1 rounded-2xl bg-zinc-900/5 p-1">
            <Tabs.Trigger value="mark" className={tabCls}>Take attendance</Tabs.Trigger>
            <Tabs.Trigger value="records" className={tabCls}>Records</Tabs.Trigger>
          </Tabs.List>
        )}
        {user?.role === "teacher" && <Tabs.Content value="mark" className="outline-none"><MarkAttendance /></Tabs.Content>}
        <Tabs.Content value="records" className="outline-none"><ClassRecords /></Tabs.Content>
      </Tabs.Root>
    </>
  );
}
