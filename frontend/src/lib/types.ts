export type Role = "admin" | "teacher" | "student";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: { url?: string; public_id?: string };
}

/** `profile` is optional: the stock /auth/me doesn't send it (see BACKEND_NOTES.md). */
export interface Me extends User {
  profile?: { _id: string };
}

export interface ClassRec { _id: string; className: string; createdAt?: string }
export interface SectionRec { _id: string; sectionName: string; class: string | ClassRec }
export interface TeacherRec {
  _id: string;
  user: User;
  qualification?: string;
  experience?: number;
  salary?: number;
  subjectsSpecialization?: string;
  subjectSpecialization?: string;
  joiningDate?: string;
  phone?: string;
  gender?: "male" | "female";
  address?: string;
}
export interface StudentRec {
  _id: string;
  user: User;
  class?: ClassRec | null;
  section?: SectionRec | null;
  rollNumber?: string;
  fatherName?: string;
  motherName?: string;
  phone?: string;
  gender?: "male" | "female";
  dob?: string;
  address?: string;
  admissionDate?: string;
}
export interface SubjectRec {
  _id: string;
  subjectName: string;
  subjectCode: string;
  class: ClassRec | string;
  teacher?: TeacherRec | string | null;
  description?: string;
}
export interface ExamRec {
  _id: string;
  examName: string;
  class: ClassRec;
  section: SectionRec;
  subject: SubjectRec;
  examDate: string;
  totalMarks: number;
  passingMarks: number;
  description?: string;
}
export interface ResultRec {
  _id: string;
  student: string;
  exam: ExamRec;
  obtainedMarks: number;
  percentage?: number;
  grade?: string;
  remarks?: string;
  status?: "pass" | "fail";
}
export type AttendanceStatus = "present" | "absent" | "leave";
export interface AttendanceRec {
  _id: string;
  student: StudentRec | string;
  class: ClassRec | string;
  section: SectionRec | string;
  subject: SubjectRec;
  status: AttendanceStatus;
  remarks?: string;
  attendanceDate: string;
}
export interface Attachment { url?: string; ulr?: string; public_id?: string }
export interface AssignmentRec {
  _id: string;
  title: string;
  description?: string;
  class?: ClassRec | string;
  section?: SectionRec | string;
  subject?: SubjectRec | string;
  teacher?: TeacherRec | string;
  dueDate?: string;
  attachment?: Attachment;
  createdAt?: string;
}
export interface SubmissionRec {
  _id: string;
  assignment: AssignmentRec | string;
  student: StudentRec | string;
  submissionText?: string;
  attachment?: Attachment;
  submittedAt: string;
  status: "submitted" | "reviewed";
  teacherRemarks?: string;
  marksAwarded?: number;
}
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export type Day = (typeof DAYS)[number];
export interface TimetableRec {
  _id: string;
  class?: ClassRec | string;
  section?: SectionRec | string;
  day: Day;
  periodNumber?: number;
  /** Backend sorts on a misspelt `peroidNumber`; tolerate both. */
  peroidNumber?: number;
  startTime: string;
  endTime: string;
  subject?: SubjectRec;
  teacher?: TeacherRec;
}
