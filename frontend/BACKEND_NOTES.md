# Backend issues found while building the frontend

The frontend follows the API as it was *intended*. These bugs in `backend/` make some screens
fail until fixed. Nothing in `backend/` was changed.

## Breaks endpoints (500s / silent no-ops)

| File | Problem | Fix |
| --- | --- | --- |
| `subject.controller.js` `getAllSubjects` | calls `.teacher({...})` on the query | `.populate({ path: "teacher", populate: { path: "user" } })` |
| `assignment.controller.js` | `pouplate` / `pupulate` / `poulate` typos; `error.messsage` | spell `populate` / `message` |
| `assignment.controller.js` + model | saves `{ ulr }` into `attachment`; model field is `attachmentDate` | model: `attachment: { public_id, url }`; controller: `url:` |
| `assignmentSubmission.controller.js` | `Assignment.finById`; `reviewSubmission` never `await`s the update | `findById`; `await` |
| `exam.routes.js` | `authorizeRole("admin", deleteExam)` — handler is inside the call | `authorizeRole("admin"), deleteExam` |
| `exam.controller.js` `deleteExam` | missing `await` on `findById`; responds `success: false` | await; `true` |
| `timetable.controller.js` | student/teacher timetable use `find()` (array) then read `.classId`/`.sectionId`, which don't exist; sort key typo `peroidNumber` (also in the model's unique index) | `findOne({ user })`, use `.class`/`.section`; teachers should query by `teacher: profile._id`; fix typo |
| `result.model.js` | field is `precentage`, controller writes `percentage` (dropped) | rename in model (UI computes it meanwhile) |
| `teacherProfile.model.js` | `subjectsSpecialization` vs controller `subjectSpecialization` | pick one |
| `result.controller.js` | `getStudentResults` responds `success: false` | `true` |

## Missing pieces the UI needs

1. **A student's own profile id.** Students need their `StudentProfile._id` for
   `/attendance/stats/:id`, `/attendance/student/:id`, `/results/:id`, but nothing returns it. Extend `getMe`:

   ```js
   let profile = null;
   if (user.role === "student") profile = await StudentProfile.findOne({ user: user._id }).select("_id");
   if (user.role === "teacher") profile = await TeacherProfile.findOne({ user: user._id }).select("_id");
   res.json({ success: true, user, profile });
   ```
   The frontend reads `profile._id` from `/auth/me` (beside `user`, or nested on it).

2. **Teachers can't list classes, sections, subjects or students** (all admin-only), so they can't choose a class
   to mark attendance or a student to enter a result. Allow `"teacher"` on `GET /class/get`,
   `GET /section/:classId`, `GET /subject/get`, `GET /user-management/students`. The UI handles the 403 gracefully.

## Smaller things

- Login limiter: 5 attempts / 15 min per IP — easy to trip in development.
- Cookie is `secure: false, sameSite: "strict"`; on HTTPS across domains you'll need `secure: true`, `sameSite: "none"`.
- `forgotPassword` returns 404 with `success: true` for unknown emails (also reveals which emails exist).
- `getAttendanceStats` divides by zero when a student has no records (`NaN` → `null`); the UI shows 0%.
- `markAttendance` needs a TeacherProfile, so admins can view attendance but not mark it.
- `updateStudent` / `updateTeacher` pass `req.body` straight into the profile (mass assignment).
