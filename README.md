# Job Board API

A RESTful API for a modern job board platform, built with **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM**. It supports user roles (applicant & employer), company and job listings, job applications, and robust access control.

---

## Live Demo

- **Base URL:** [https://job-board-api-4okp.onrender.com](https://job-board-api-4okp.onrender.com)
- **Swagger Docs:** [https://job-board-api-4okp.onrender.com/api-docs](https://job-board-api-4okp.onrender.com/api-docs)

---

## Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Documentation:** Swagger UI
- **Deployment:** Render

---

## Features

- User registration/login with JWT
- Role-based access (Applicant / Employer)
- Company creation, update, soft delete/reactivate
- Job posting and filtering
- Job applications and applicant tracking
- Application status update (pending → accepted/rejected)
- Swagger documentation for all endpoints
- Pagination and filtering for public job listings

---

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/xylemic/job-board-api.git
cd job-board-api
npm install

