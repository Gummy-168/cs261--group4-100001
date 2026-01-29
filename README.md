# CS261 Group 4 — Web Application (Frontend + Backend)

Course project repository for **CS261 (Software Engineering / System Analysis & Design)**.
This repo contains a full-stack web application with separate **frontend** and **backend** codebases.

---

## ✨ Overview

This is a team-based full-stack web application developed as part of CS261. The system follows a typical web architecture:

* **Frontend** provides the user interface.
* **Backend** provides REST APIs and business logic.
* **Database** is **Microsoft SQL Server**, supported via **Docker** for local development.

---

##  Tech Stack

* **Frontend:** Next.js + Tailwind CSS
* **Backend:** Spring Boot (Maven)
* **Database:** Microsoft SQL Server (T-SQL)
* **Dev Tools / Workflow:** Git & GitHub, IntelliJ IDEA, VS Code, Trello

---

##  Branches (Where to find the latest code)

This repository contains multiple branches for different workstreams. Please switch branches on GitHub to view the latest code.

* **Frontend (latest):** `Frontend`
* **Backend (Sprint 2 latest):** `be/backend-sprint2`

> Tip: If you open this repo on `main` and cannot find the newest files, switch to the branch above.

---

## 🌐 Ports

* **Frontend:** `http://localhost:5173` (project-configured)
* **Backend:** `http://localhost:8080`

> Note: Next.js normally runs on `3000`. This project is configured to use `5173`. If your environment shows a different port, follow the port displayed in the terminal.

---

## 📁 Repository Structure

```txt
cs261--group4-100001/
├─ backend/         # Spring Boot (Maven)
└─ frontend/        # Next.js + Tailwind CSS
```

---

## ✅ Prerequisites

Install tools based on your OS.

### Frontend

* **Node.js** (recommended: 18+)
* **npm** (or your preferred package manager)

### Backend

* **Java** (recommended: 17)
* **IntelliJ IDEA** (recommended for running the backend)
* **Maven** (IntelliJ can handle Maven projects automatically)

### Database

* **Docker Desktop** (recommended for local DB container)
* **Microsoft SQL Server** (if running DB without Docker)

---

##  Getting Started

### 1) Clone the repository

```bash
git clone https://github.com/Gummy-168/cs261--group4-100001.git
cd cs261--group4-100001
```

### 2) Checkout the latest branches

You may develop/run the project from the latest branch for each part:

* Frontend:

```bash
git checkout Frontend
```

* Backend (Sprint 2):

```bash
git checkout be/backend-sprint2
```

> If you are using GitHub Web UI, use the branch dropdown to switch.

---

## 🗄️ Database (Microsoft SQL Server)

This project uses **Microsoft SQL Server**.

### ✅ Latest SQL Script Location

The latest SQL script (Sprint 2) is located at:

* `backend/src/main/resources/data/SQL_database_sprint2.sql`

### Setup (recommended)

1. Create a new database in SQL Server (example name: `cs261_db`).
2. Execute the script:

   * `backend/src/main/resources/data/SQL_database_sprint2.sql`
3. Ensure the backend DB connection points to the correct server and database.

### Docker (DB helper)

Docker is used as a helper for local database setup.

* Start **Docker Desktop**
* Start the SQL Server container (if your team provides a Docker/Compose setup)
* Update backend configuration to match the container host/port

> Note: This README does not assume a specific `docker-compose.yml` path since it may vary by branch. If your repo includes a compose file, add its exact path and run command here.

---

## 🔧 Backend (Spring Boot + Maven) — `backend/`

### Run with IntelliJ IDEA (recommended)

1. Open the **backend** project in IntelliJ IDEA.
2. Confirm the **JDK** version (recommended: Java 17).
3. Configure database settings (see **Backend Configuration** below).
4. Click **Run ▶️** on the Spring Boot main class.

Backend will run at:

* `http://localhost:8080`

### Run via Maven (optional)

```bash
cd backend
mvn spring-boot:run
```

---

## ⚙️ Backend Configuration (DB Connection)

Update DB connection in:

* `backend/src/main/resources/application.properties` **or** `application.yml`

Example (adjust fields to your real config):

```properties
# Example ONLY
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=cs261_db;encrypt=true;trustServerCertificate=true
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

> ✅ Security Tip: Do **not** commit real credentials. Keep secrets in local config or environment variables and add them to `.gitignore`.

---

## 🖥️ Frontend (Next.js + Tailwind CSS) — `frontend/`

### Install dependencies

```bash
cd frontend
npm install
```

### Run development server

```bash
npm run dev
```

Frontend will run at:

* `http://localhost:5173`

---

## 🔌 API

Backend base URL:

* `http://localhost:8080`

If Swagger/OpenAPI is enabled, add the URL here (optional):

* `http://localhost:8080/swagger-ui/index.html`

---

##  Testing (optional)

* **Backend:**

```bash
cd backend
mvn test
```

* **Frontend:** use the project scripts (if available)

```bash
cd frontend
npm run test
```

---

##  Git Workflow (Team)

Recommended workflow:

1. Create task (Trello / GitHub issue)
2. Create branch: `feature/...` or `fix/...`
3. Commit changes with clear messages
4. Open Pull Request → request review → merge

---

## 👥 Contributors

* CS261 Group 8 members

---

## 📜 License

Educational project for CS261.
