import {
  BookOpen, CalendarClock, CalendarCheck2, ClipboardList, FileText, GraduationCap,
  LayoutDashboard, Layers, Medal, UserRound, Users, type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export interface NavItem { to: string; label: string; icon: LucideIcon }
export interface NavGroup { label?: string; items: NavItem[] }

const dash: NavItem = { to: "/", label: "Overview", icon: LayoutDashboard };

export const NAV: Record<Role, NavGroup[]> = {
  admin: [
    { items: [dash] },
    {
      label: "People",
      items: [
        { to: "/students", label: "Students", icon: GraduationCap },
        { to: "/teachers", label: "Teachers", icon: Users },
      ],
    },
    {
      label: "Academics",
      items: [
        { to: "/classes", label: "Classes & sections", icon: Layers },
        { to: "/subjects", label: "Subjects", icon: BookOpen },
        { to: "/timetable", label: "Timetable", icon: CalendarClock },
        { to: "/exams", label: "Exams", icon: ClipboardList },
        { to: "/results", label: "Results", icon: Medal },
      ],
    },
    {
      label: "Classroom",
      items: [
        { to: "/attendance", label: "Attendance", icon: CalendarCheck2 },
        { to: "/assignments", label: "Assignments", icon: FileText },
      ],
    },
  ],
  teacher: [
    { items: [dash] },
    {
      label: "Teaching",
      items: [
        { to: "/attendance", label: "Attendance", icon: CalendarCheck2 },
        { to: "/assignments", label: "Assignments", icon: FileText },
        { to: "/exams", label: "Exams", icon: ClipboardList },
        { to: "/results", label: "Results", icon: Medal },
        { to: "/timetable", label: "My timetable", icon: CalendarClock },
      ],
    },
  ],
  student: [
    { items: [dash] },
    {
      label: "Learning",
      items: [
        { to: "/assignments", label: "Assignments", icon: FileText },
        { to: "/timetable", label: "Timetable", icon: CalendarClock },
        { to: "/attendance", label: "Attendance", icon: CalendarCheck2 },
        { to: "/results", label: "Results", icon: Medal },
      ],
    },
  ],
};

export const ROLE_ICON = { admin: UserRound, teacher: Users, student: GraduationCap } as const;
