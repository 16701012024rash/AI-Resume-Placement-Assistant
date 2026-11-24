# Backend Integration & Database Module

## Overview

This module is responsible for the backend integration of the AI Resume & Placement Assistant project.

It provides:

- User Authentication
- Resume Management
- Dashboard APIs
- MongoDB Database Integration
- Backend API Integration
- Communication with AI Engine and Resume Analysis modules

---

## Features

### User Authentication

- User Registration
- User Login
- JWT Authentication
- Password Hashing
- Protected Routes

---

### Resume Management

- Upload Resume
- View Uploaded Resumes
- Delete Resume
- Store Resume Metadata

---

### Dashboard

Provides APIs to retrieve user information including:

- User Profile
- Uploaded Resume Details
- Resume Count
- Dashboard Summary

---

### Career Roadmap

The roadmap API creates a role-specific weekly study plan based on the
student's current skills, skill gaps, timeline, and weekly study hours. Each
week includes a measurable objective, checkable tasks, and curated free
learning resources. The frontend saves roadmap progress in the current
browser so completed tasks and the overall progress bar remain available after
refreshing the page.

---

### Database

MongoDB is used as the primary database.

Collections include:

- users
- resumes

---

## Tech Stack

- FastAPI
- MongoDB Atlas
- Motor (Async MongoDB Driver)
- Pydantic
- JWT Authentication
- Python

---

## Project Structure

backend/
```

auth.py
resume.py
dashboard.py
config.py
interview.py

```

database/
```

user_schema.py
resume_schema.py
interview_schema.py

```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /signup | Register User |
| POST | /login | Login User |

---

### Resume

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | /upload-resume | Upload Resume |
| GET | /resumes | Get User Resumes |
| DELETE | /resume/{id} | Delete Resume |

---

### Dashboard

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /dashboard | Dashboard Data |

---

## Installation

Clone the repository

```bash
git clone <repository-url>
```

Create virtual environment

```bash
python -m venv venv
```

Activate virtual environment

### macOS/Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

For local development, create a repository-root `.env` file:

```dotenv
APP_ENV=development
AI_PROVIDER=ollama
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:1b
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB_NAME=placement_assistant
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
JWT_SECRET=dev-insecure-secret-change-me
```

For Render, set `APP_ENV=production`, `AI_PROVIDER=gemini`, `GEMINI_API_KEY`,
`MONGO_URI` (MongoDB Atlas SRV connection string), `MONGO_DB_NAME`,
`JWT_SECRET`, and `CORS_ORIGINS` in the API service environment. See the
repository [Render deployment guide](../README.md#deploy-to-render) for the
frontend URL and the full variable list. The `/health` endpoint pings MongoDB
and returns HTTP 503 when the database is unreachable.

---

## Running the Backend

```bash
uvicorn backend.interview:app --reload
```

Server will run at:

```
http://127.0.0.1:8002
```

Swagger Documentation:

```
http://127.0.0.1:8002/docs
```

---

## Integration

This module integrates with:

- Frontend (React)
- Resume Analysis Module
- AI Engine
- Interview Preparation Module
- MongoDB Database

---

## Future Enhancements

- Resume Analysis Integration
- AI Skill Gap Integration
- Placement Readiness Tracking
- Analytics Dashboard

---

