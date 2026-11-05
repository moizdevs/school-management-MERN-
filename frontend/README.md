# Schoolhouse — frontend

React 19 · TypeScript · Tailwind CSS v4 · Radix primitives · TanStack Query · Lucide.
Talks to the Express/Mongo backend in `../backend` using its httpOnly cookie auth.

## Run it

```bash
# 1. backend (needs Mongo URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, FRONTEND_URL=http://localhost:5173)
cd backend && npm i && npm run dev        # http://localhost:8000

# 2. frontend
cd frontend && npm i && npm run dev       # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:8000` (override with `VITE_BACKEND_URL`), so the
`SameSite=Strict` login cookie works without CORS fiddling. For production, serve the built
`dist/` from the same site as the API, or set `VITE_API_URL` and adjust the cookie options.

Sign in with the seeded `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then create classes → sections →
teachers → subjects → students.

## Screens

| Role | Screens |
| --- | --- |
| Admin | Overview, Students, Teachers, Classes & sections, Subjects, Timetable builder, Exams, Results, Attendance records, Assignments |
| Teacher | Overview, Take attendance, Assignments (post, review submissions), Exams, Record results, My timetable |
| Student | Overview, Assignments (submit work), Timetable, Attendance, Results |

Forgot / reset password flows are included.

## Structure

```
src/
  lib/         api client, auth context, react-query hooks, types
  components/  ui/ (Button, Card.*, Modal, DataTable, Field…), layout/ (AppShell, nav)
  pages/       one file per screen
```

**The backend has bugs that affect several screens — read `BACKEND_NOTES.md` first.**
