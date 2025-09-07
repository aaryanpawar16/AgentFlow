AgentFlow

AgentFlow is a modular multi-agent workflow system that streamlines document analysis, verification, and risk detection.
It integrates authentication, calendar scheduling, and AI-driven agents to provide an end-to-end automated workflow.

✨ Features

🗂 Agent-based Architecture – Each agent (A, B, etc.) is responsible for a dedicated task (e.g., document intake, verification).

🔑 JWT Authentication with Descope integration for secure access.

📅 Calendar Scheduling for slot booking and workflow management.

📊 Risk Analysis for contracts, policies, and legal documents.

🌐 Frontend (React + Vite + Tailwind) with animations via Framer Motion & GSAP.

⚡ Backend (Node.js + Express + Python Agents) for robust and scalable execution.

⚙️ Installation
1️⃣ Clone the Repository
git clone https://github.com/aaryanpawar16/AgentFlow.git
cd AgentFlow

2️⃣ Backend Setup
cd backend
npm install


Create a .env file inside backend/ with:

PORT=5000
DESCOPE_PROJECT_ID=your_project_id
JWT_SECRET=your_secret


Run backend:

node server.js

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

🚀 Usage

Login via Descope-authenticated login.

Upload documents to start analysis.

Workflow triggers Agent A (document intake) and Agent B (verification).

Calendar API can be used to book slots.

Dashboard displays risks, status, and reports.

🛠️ Tech Stack

Frontend: React, Vite, TailwindCSS, Framer Motion, GSAP

Backend: Node.js, Express, JWT Auth (Descope)

Agents: Python (document analysis, verification, risk detection)

Database (Optional): PostgreSQL / MongoDB

Icons: Lucide-react

📸 Screenshots 

Home Page
<img width="1291" height="782" alt="image" src="https://github.com/user-attachments/assets/f1a24f8e-ad1d-4e8e-bf3a-4af5976ddc52" />

Workflow Page
<img width="1594" height="884" alt="image" src="https://github.com/user-attachments/assets/d819306d-be66-4aa0-a525-4532fa1d4f11" />

Dashboard
<img width="1693" height="886" alt="image" src="https://github.com/user-attachments/assets/9db082f3-a1e4-4f87-91fa-e3e623db70c9" />
