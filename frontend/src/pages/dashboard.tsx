import { BookOpen, CalendarCheck2, ClipboardList, FileText, GraduationCap, Layers, Medal, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader, Stat } from "@/components/ui/misc";
import { Empty } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useClasses, useExams, useMyProfileId, useStudents, useSubjects, useTeachers } from "@/lib/queries";
import type { AssignmentRec, ExamRec, ResultRec } from "@/lib/types";
import { fmtDate, pct } from "@/lib/utils";

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

function UpcomingExams({ exams, loading }: { exams?: ExamRec[]; loading?: boolean }) {
  const upcoming = exams?.filter((e) => new Date(e.examDate) >= new Date(new Date().toDateString())).sort((a, b) => +new Date(a.examDate) - +new Date(b.examDate)).slice(0, 5);
  return (
    <Card>
      <Card.Header><div><Card.Title>Upcoming exams</Card.Title><Card.Description>Next five on the calendar</Card.Description></div><Link to="/exams" className="inline-flex min-h-11 items-center text-[13px] font-medium text-pine-600 hover:underline">View all</Link></Card.Header>
      {loading ? <div className="space-y-3 p-5"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div> :
        !upcoming?.length ? <Empty icon={ClipboardList} title="Nothing scheduled" body="No upcoming exams." /> : (
          <ul className="divide-y divide-zinc-900/5">
            {upcoming.map((e, i) => (
              <li key={e._id} style={{ "--i": i } as React.CSSProperties} className="stagger flex items-center gap-4 px-5 py-3 sm:px-6">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-pine-50 text-pine-700 tabular-nums">
                  <div className="text-center leading-none"><p className="text-[10px] font-semibold uppercase tracking-wider">{new Date(e.examDate).toLocaleDateString(undefined, { month: "short" })}</p><p className="mt-0.5 text-lg font-semibold">{new Date(e.examDate).getDate()}</p></div>
                </div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{e.examName}</p><p className="truncate text-xs text-zinc-500">{e.subject?.subjectName} · {e.class?.className}</p></div>
                <Badge tone="brass">{e.totalMarks} marks</Badge>
              </li>
            ))}
          </ul>
        )}
    </Card>
  );
}

function Shortcuts({ items }: { items: { to: string; label: string; hint: string; icon: typeof Users }[] }) {
  return (
    <Card>
      <Card.Header><Card.Title>Jump to</Card.Title></Card.Header>
      <ul className="grid gap-1 p-2">
        {items.map((it) => (
          <li key={it.to}><Link to={it.to} className="group flex min-h-14 items-center gap-3 rounded-xl px-3 outline-none transition-colors hover:bg-pine-50 focus-visible:ring-2 focus-visible:ring-pine-500">
            <span className="grid size-9 place-items-center rounded-lg bg-pine-50 text-pine-600 transition-colors group-hover:bg-white"><it.icon className="size-4" aria-hidden /></span>
            <span className="min-w-0"><span className="block text-sm font-medium">{it.label}</span><span className="block truncate text-xs text-zinc-500">{it.hint}</span></span>
          </Link></li>
        ))}
      </ul>
    </Card>
  );
}

function AdminDash() {
  const students = useStudents(); const teachers = useTeachers(); const classes = useClasses(); const subjects = useSubjects(); const exams = useExams();
  const v = (q: { data?: unknown[]; isLoading: boolean }) => (q.isLoading ? "–" : q.data?.length ?? 0);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat tone="dark" i={0} label="Students" value={v(students)} icon={<GraduationCap className="size-4" />} hint="Enrolled" />
        <Stat i={1} label="Teachers" value={v(teachers)} icon={<Users className="size-4" />} />
        <Stat i={2} label="Classes" value={v(classes)} icon={<Layers className="size-4" />} />
        <Stat i={3} label="Subjects" value={v(subjects)} icon={<BookOpen className="size-4" />} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <UpcomingExams exams={exams.data} loading={exams.isLoading} />
        <Shortcuts items={[
          { to: "/students", label: "Enroll a student", hint: "Create a login and profile", icon: GraduationCap },
          { to: "/classes", label: "Set up classes", hint: "Grades and sections", icon: Layers },
          { to: "/timetable", label: "Build a timetable", hint: "Plan the week", icon: CalendarCheck2 },
        ]} />
      </div>
    </>
  );
}

function TeacherDash() {
  const exams = useExams();
  const a = useQuery({ queryKey: ["assignments", "teacher"], queryFn: async () => (await api<{ assignments: AssignmentRec[] }>("/assignments")).assignments, retry: 0 });
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat tone="dark" i={0} label="Assignments posted" value={a.isLoading ? "–" : a.data?.length ?? 0} icon={<FileText className="size-4" />} />
        <Stat i={1} label="Exams on record" value={exams.isLoading ? "–" : exams.data?.length ?? 0} icon={<ClipboardList className="size-4" />} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <UpcomingExams exams={exams.data} loading={exams.isLoading} />
        <Shortcuts items={[
          { to: "/attendance", label: "Take attendance", hint: "Mark today's class", icon: CalendarCheck2 },
          { to: "/assignments", label: "Review submissions", hint: "Give marks and feedback", icon: FileText },
          { to: "/results", label: "Record results", hint: "Enter exam marks", icon: Medal },
        ]} />
      </div>
    </>
  );
}

function StudentDash() {
  const id = useMyProfileId();
  const a = useQuery({ queryKey: ["assignments", "student"], queryFn: async () => (await api<{ assignments: AssignmentRec[] }>("/assignments/student")).assignments, retry: 0 });
  const att = useQuery({ queryKey: ["attendance", "stats", id], enabled: !!id, queryFn: () => api<{ percentage: string | null }>(`/attendance/stats/${id}`) });
  const res = useQuery({ queryKey: ["results", id], enabled: !!id, queryFn: async () => (await api<{ results: ResultRec[] }>(`/results/${id}`)).results });
  const attPct = att.data?.percentage != null && !Number.isNaN(Number(att.data.percentage)) ? Math.round(Number(att.data.percentage)) : 0;
  const avg = res.data?.length ? Math.round(res.data.reduce((s, r) => s + (r.percentage != null ? Number(r.percentage) : pct(r.obtainedMarks, r.exam?.totalMarks ?? 0)), 0) / res.data.length) : 0;
  const due = a.data?.filter((x) => x.dueDate && new Date(x.dueDate) >= new Date()).sort((x, y) => +new Date(x.dueDate!) - +new Date(y.dueDate!)).slice(0, 5);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat tone="dark" i={0} label="Attendance" value={id ? `${attPct}%` : "–"} icon={<CalendarCheck2 className="size-4" />} />
        <Stat i={1} label="Average score" value={id ? `${avg}%` : "–"} icon={<Medal className="size-4" />} />
        <Stat i={2} label="Assignments" value={a.isLoading ? "–" : a.data?.length ?? 0} icon={<FileText className="size-4" />} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <Card.Header><div><Card.Title>Due soon</Card.Title><Card.Description>Upcoming deadlines</Card.Description></div><Link to="/assignments" className="inline-flex min-h-11 items-center text-[13px] font-medium text-pine-600 hover:underline">All assignments</Link></Card.Header>
          {!due?.length ? <Empty icon={FileText} title="You're all caught up" body="No upcoming deadlines." /> : (
            <ul className="divide-y divide-zinc-900/5">{due.map((x, i) => (
              <li key={x._id} style={{ "--i": i } as React.CSSProperties} className="stagger flex items-center justify-between gap-3 px-5 py-3 sm:px-6"><p className="truncate text-sm font-medium">{x.title}</p><Badge tone="warn">{fmtDate(x.dueDate)}</Badge></li>
            ))}</ul>
          )}
        </Card>
        <Shortcuts items={[
          { to: "/timetable", label: "Today's timetable", hint: "See your periods", icon: CalendarCheck2 },
          { to: "/results", label: "My results", hint: "Marks and grades", icon: Medal },
        ]} />
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <PageHeader eyebrow={new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })} title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={{ admin: "Here's how your school looks today.", teacher: "Your classroom, at a glance.", student: "Here's what's on your plate." }[user.role]} />
      {user.role === "admin" ? <AdminDash /> : user.role === "teacher" ? <TeacherDash /> : <StudentDash />}
    </>
  );
}
