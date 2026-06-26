# Internship Management Portal

## Overview

The **Internship Management Portal** is a full-stack web application developed to digitize and streamline the internship application and approval process within an organization. The system replaces manual paperwork and email-based communication with a centralized, role-based workflow that manages internship requests from submission to completion.

The application enables students to apply for internships, upload required documents, monitor application status, and receive feedback throughout the approval process. Organizational stakeholders—including HR, Heads of Department (HODs), Mentors, Learning & Development (L&D), and Administrators—can review applications, assign mentors, track intern progress, and manage the complete internship lifecycle through dedicated dashboards.

---

## Objectives

* Eliminate manual internship processing.
* Centralize internship applications and document management.
* Implement a transparent, role-based approval workflow.
* Improve collaboration between students and organizational stakeholders.
* Maintain a complete audit trail of internship activities.
* Provide a scalable foundation for enterprise internship management.

---

## Features

### Authentication & Authorization

* Secure user authentication using JSON Web Tokens (JWT).
* Password hashing using bcrypt.
* Role-based access control.
* Protected routes for all user roles.

### Student Portal

* Student registration and login.
* Internship application submission.
* Upload supporting documents in PDF format.
* Track application progress through each approval stage.
* View remarks and modification requests.
* Resubmit applications after requested corrections.
* Receive notifications throughout the workflow.

### Human Resources (HR)

* Review submitted internship applications.
* Verify uploaded documents.
* Request modifications.
* Approve or reject applications.
* Forward approved applications to the appropriate Head of Department.

### Head of Department (HOD)

* Review department-specific internship applications.
* Approve or reject applications.
* Assign faculty mentors to approved interns.
* Forward applications for final organizational review.

### Mentor Module

* View assigned interns.
* Monitor internship progress.
* Review submitted weekly reports.
* Track attendance records.

### Learning & Development (L&D)

* Perform final internship approval.
* Activate internship records.
* Upload internship completion certificates.
* Mark internships as completed.

### Administrator

* Manage system users.
* Manage organizational roles.
* Access administrative dashboards.
* View overall internship statistics.

---

## Internship Workflow

Student Registration

↓

Application Submission

↓

HR Review

* Approve
* Reject
* Request Modification

↓

Head of Department Review

↓

Mentor Assignment

↓

Learning & Development Review

↓

Internship Activated

↓

Weekly Progress Tracking

↓

Certificate Upload

↓

Internship Completion

---

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer
* bcrypt
* CORS

### Database

* SQLite (default)
* MySQL-compatible database adapter for future migration

---

## Database Design

The application maintains multiple relational entities, including:

* Users
* Roles
* Departments
* Internship Applications
* Application Documents
* Mentor Assignments
* Attendance
* Weekly Reports
* Weekly Report Comments
* Notifications
* Certificates
* Internship Summaries
* Activity Logs

---

## Project Structure

```
Internship-Management-Portal/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── index.js
│   │
│   ├── data/
│   ├── uploads/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   └── assets/
│   │
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/mindtasty/IOCL-Internship-Portal.git
```

---

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs on:

```
http://localhost:5000
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

Example:

```
JWT_SECRET=your_secret_key
DB_DIALECT=sqlite
DB_STORAGE=data/internship_portal.sqlite
```

---

## API Endpoints

The backend exposes RESTful APIs for:

* Authentication
* Internship Applications
* Attendance
* Mentor Management
* Weekly Reports
* Notifications
* Administrative Operations

---

## Security Features

* JWT-based authentication.
* Password hashing using bcrypt.
* Role-based authorization.
* Protected API endpoints.
* Server-side validation.
* Secure document upload handling.

---

## Future Improvements

* Email notifications.
* Cloud-based document storage.
* PostgreSQL/MySQL production deployment.
* Digital signatures.
* AI-assisted document verification.
* Analytics dashboard.
* Multi-organization support.
* Calendar integration.
* Mobile-responsive enhancements.

---

## Known Limitations

* SQLite is used as the default database for development.
* Uploaded files are stored locally.
* Production deployments should use persistent cloud storage and a managed relational database.

---

## License

This project is intended for educational and internship demonstration purposes.

---

## Acknowledgements

Developed as part of an internship project to demonstrate the application of full-stack web development concepts, database management, secure authentication, workflow automation, and role-based access control in an internship management system.
