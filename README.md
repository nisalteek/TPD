# Teacher Performance & Development Tracking System

A full-stack web application for schools to track teacher performance,
attendance, training, feedback, lesson plans, and career milestones —
built with a formal, professional glassmorphism interface.

## Project Overview

The system supports two account types:

- **Teacher accounts** — self-register, mark daily attendance, log
  training and download real generated PDF certificates, submit lesson
  plans for approval, review feedback they've received, and track their
  own analytics and recognition points.
- **Admin accounts** — created by an existing admin (see setup below),
  manage the teacher directory, mark training as completed to issue
  certificates, review and approve/reject lesson plans, submit
  feedback, award milestones and points, and view school-wide analytics.

Additional features:

- **Digital attendance system** with automatic late detection.
- **Certificate generator** — produces a real, uniquely styled PDF on
  demand (no static template files), verifiable by a unique certificate ID.
- **Visual analytics** — attendance rate, rating breakdowns, training
  hours, and lesson plan status, rendered with interactive charts.
- **Gamification** — points and milestone awards, with a school-wide
  leaderboard on the admin dashboard.
- **AI assistant (chatbot)** — a floating assistant that answers common
  questions about attendance, certificates, and lesson plans. It works
  out of the box with a built-in knowledge base and can optionally be
  connected to a real AI provider by setting `OPENAI_API_KEY`.

## Technologies Used

**Frontend**
- React 18 (Vite)
- React Router
- Recharts (analytics charts)
- Axios
- Plain CSS (custom glassmorphism design system — no UI framework)
- Font Awesome icons, Google Fonts (Sora / Inter)

**Backend**
- Node.js + Express
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing
- PDFKit for real, dynamically generated certificate PDFs
- Helmet + express-rate-limit for basic API hardening
- express-validator for input validation

**Deployment target**
- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas

## Project Structure

```
teacher-tracker/
├── server/          # Express + MongoDB API
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seedAdmin.js
│   └── server.js
└── client/          # React (Vite) frontend
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── pages/
        └── styles/
```

## Setup Instructions (Local Development, VS Code)

### 1. Database
Create a free cluster at MongoDB Atlas (or run MongoDB locally) and
copy the connection string.

### 2. Backend
```bash
cd server
npm install
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, CLIENT_URL
npm run dev
```
This starts the API on `http://localhost:5000`.

Create the first admin account (required once, since admin accounts
can only otherwise be created by an existing admin):
```bash
node seedAdmin.js "Admin Name" admin@school.edu "StrongPassword123"
```

### 3. Frontend
```bash
cd client
npm install
cp .env.example .env
# Edit .env: set VITE_API_URL to your backend URL
npm run dev
```
This starts the app on `http://localhost:5173`.

### 4. Using the App
- Visit the app, register a teacher account (or sign in as the admin
  you just seeded).
- As admin: open **Teachers**, review the directory, award milestones,
  mark training as completed to issue certificates, and approve
  lesson plans.
- As teacher: check in on **Attendance**, log training on **Training &
  Certifications** and download your certificate once an admin marks
  it complete, draft and submit **Lesson Plans**, and review
  **Feedback** and **Analytics**.

## Deployment

**Backend (Render)**
1. Push this repository to GitHub.
2. Create a new Web Service on Render, root directory `server`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables from `server/.env.example` (use your real
   `MONGO_URI`, a strong `JWT_SECRET`, and your deployed frontend URL
   as `CLIENT_URL`).

**Frontend (Netlify)**
1. New site from Git, base directory `client`.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Add environment variable `VITE_API_URL` pointing to your Render
   backend, e.g. `https://your-api.onrender.com/api`.

## Security Notes

- Passwords are hashed with bcrypt and never stored or returned in
  plain text.
- All protected routes require a valid JWT; role-based checks
  (`admin` vs `teacher`) are enforced on the server, not just the UI.
- Rate limiting and Helmet security headers are enabled by default.

## Author

Built as an individual, original submission for the Teacher
Performance & Development Tracking System project.
