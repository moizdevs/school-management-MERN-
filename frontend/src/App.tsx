import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import Login from "@/pages/login";
import { ForgotPassword, ResetPassword } from "@/pages/password";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Teachers from "@/pages/teachers";
import Classes from "@/pages/classes";
import Subjects from "@/pages/subjects";
import Exams from "@/pages/exams";
import Results from "@/pages/results";
import Attendance from "@/pages/attendance";
import Assignments from "@/pages/assignments";
import Timetable from "@/pages/timetable";

function Guard({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return <div className="grid min-h-dvh place-items-center"><Loader2 className="size-6 animate-spin text-pine-600 motion-reduce:animate-none" aria-label="Loading" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route element={<Guard><AppShell /></Guard>}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Guard roles={["admin"]}><Students /></Guard>} />
        <Route path="teachers" element={<Guard roles={["admin"]}><Teachers /></Guard>} />
        <Route path="classes" element={<Guard roles={["admin"]}><Classes /></Guard>} />
        <Route path="subjects" element={<Guard roles={["admin"]}><Subjects /></Guard>} />
        <Route path="exams" element={<Guard roles={["admin", "teacher"]}><Exams /></Guard>} />
        <Route path="results" element={<Results />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="timetable" element={<Timetable />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
