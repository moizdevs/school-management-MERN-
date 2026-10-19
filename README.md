# School Management System (MERN)

A full-stack school management system built with the MERN stack. This project currently focuses on the backend API for handling school operations such as authentication, user management, academic records, attendance, exams, results, assignments, and timetables.

## Features

- Admin and user authentication
- JWT-based authorization
- Role-protected routes
- User management
- Class and section management
- Subject management
- Attendance tracking
- Exam and result management
- Assignment creation and student submissions
- Timetable management
- Email-based password reset
- Cloudinary image upload support
- Default admin seeding on startup

## Tech Stack

- Frontend: React / frontend app
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JWT, bcryptjs
- File Uploads: Cloudinary
- Email: Nodemailer
- Security: Helmet, CORS, rate limiting

## Project Structure

```bash
school-management-system/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── templates/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── .env
├── frontend/
│   └── ...
└── README.md
