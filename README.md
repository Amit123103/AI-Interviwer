# Intervyxa AI Platform

An end-to-end, production-ready Intervyxa AI Platform that automates the technical and behavioral interview process. The platform features a real-time AI interviewer capable of speech interaction, vision-based behavior analysis, and dynamic question generation.

## 🌟 Key Features

- **Real-time AI Interviewer**: Voice-enabled interaction using local Whisper (STT) and Edge-TTS.
- **Dynamic Questioning**: Adaptive difficulty scaling based on candidate performance.
- **Vision Analysis**: Behavioral tracking (eye contact, head movement) using MediaPipe.
- **Resume-Driven Interviews**: Personalized interview focus based on uploaded resumes.
- **Comprehensive Reports**: Detailed feedback with performance metrics and video recording.
- **Admin Dashboard**: Manage interviews, candidates, and review performance reports.
- **Fully Local AI Option**: Support for local LLM inference via Ollama (Llama 3.1).

## 🏗️ System Architecture

The platform consists of three main services:

1.  **Frontend (Client)**: A Next.js 16 application for students and admins.
2.  **Backend (Server)**: An Express 5 API server handling business logic, authentication, and data orchestration.
3.  **AI Service**: A Python FastAPI service managing LLM reasoning, STT, TTS, and vision analysis.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI, Lucide React, Framer Motion
- **Editor**: Monaco Editor (for technical coding rounds)
- **State/Data**: Axios, Zod, React Hook Form

### Backend (Server)
- **Language**: TypeScript
- **Framework**: Express 5
- **Database**: MongoDB (via Mongoose)
- **Real-time**: Socket.io
- **Payments**: Stripe Integration
- **Mailing**: Nodemailer

### AI Service
- **Framework**: FastAPI
- **LLM Engine**: Ollama (Local Llama 3.1:8b)
- **Speech-to-Text**: OpenAI Whisper (Local)
- **Text-to-Speech**: Edge-TTS / gTTS
- **Vision**: MediaPipe (Head pose & eye tracking)
- **Data Processing**: NumPy, Librosa, OpenCV

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+
- **Python**: v3.10+
- **MongoDB**: v6+ (or use Docker)
- **Ollama**: Installed and running (for local LLM)

### 1. AI Service Setup
1.  Navigate to `ai-service`:
    ```bash
    cd ai-service
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    source venv/bin/activate  # Linux/macOS
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Download the LLM model:
    ```bash
    ollama pull llama3.1:8b
    ```
5.  Start the service:
    ```bash
    python -m app.main
    ```
    *The service runs at `http://localhost:8000`*

### 2. Backend Server Setup
1.  Navigate to `server`:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables (copy `.env.example` if available or create `.env`):
    - `PORT=5001`
    - `MONGO_URI`: Your MongoDB connection string
    - `JWT_SECRET`: A secure random string
4.  Start development server:
    ```bash
    npm run dev
    ```

### 3. Frontend Client Setup
1.  Navigate to `client`:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start development server:
    ```bash
    npm run dev
    ```
    *Client will be available at `http://localhost:3000`*

---

## 🐋 Database (Docker)
To quickly start a MongoDB instance:
```bash
docker-compose up -d
```

## 📄 License
This project is licensed under the ISC License.
