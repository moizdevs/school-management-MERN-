import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuth } from "./auth";
import type {
  ClassRec, ExamRec, SectionRec, StudentRec, SubjectRec, TeacherRec,
} from "./types";

/** Admin-only list endpoints. A 403 yields an empty list instead of an error. */
async function listOrEmpty<T>(path: string, key: string): Promise<T[]> {
  try {
    const r = await api<Record<string, T[]>>(path);
    return r[key] ?? [];
  } catch (e) {
    if (e instanceof ApiError && (e.status === 403 || e.status === 401)) return [];
    throw e;
  }
}

export const useExams = () =>
  useQuery({ queryKey: ["exams"], queryFn: () => listOrEmpty<ExamRec>("/exams", "exams") });

export const useClasses = () => {
  const exams = useExams();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["classes", user?.role, exams.data?.length],
    enabled: user?.role === "admin" || exams.isSuccess,
    queryFn: async () => {
      const direct = await listOrEmpty<ClassRec>("/class/get", "classes");
      if (direct.length || user?.role === "admin") return direct;
      // Teachers can't list classes; derive what we can from their exams.
      const map = new Map<string, ClassRec>();
      exams.data?.forEach((e) => e.class && map.set(e.class._id, e.class));
      return [...map.values()];
    },
  });
};

export const useSections = (classId?: string) => {
  const exams = useExams();
  return useQuery({
    queryKey: ["sections", classId, exams.data?.length],
    enabled: !!classId,
    queryFn: async () => {
      const direct = await listOrEmpty<SectionRec>(`/section/${classId}`, "sections");
      if (direct.length) return direct;
      const map = new Map<string, SectionRec>();
      exams.data?.forEach((e) => e.section && e.class?._id === classId && map.set(e.section._id, e.section));
      return [...map.values()];
    },
  });
};

export const useSubjects = () =>
  useQuery({ queryKey: ["subjects"], queryFn: () => listOrEmpty<SubjectRec>("/subject/get", "subjects") });

export const useStudents = () =>
  useQuery({ queryKey: ["students"], queryFn: () => listOrEmpty<StudentRec>("/user-management/students", "students") });

export const useTeachers = () =>
  useQuery({ queryKey: ["teachers"], queryFn: () => listOrEmpty<TeacherRec>("/user-management/teachers", "teachers") });

export const idOf = (x: unknown): string | undefined =>
  typeof x === "string" ? x : (x as { _id?: string } | null | undefined)?._id;

/** The student's own StudentProfile id. Needs `profile` on /auth/me (see BACKEND_NOTES.md). */
export const useMyProfileId = () => {
  const { user } = useAuth();
  return user?.profile?._id;
};
