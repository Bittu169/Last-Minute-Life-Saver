# ⏰ Last Minute Life Saver (LMLS)
### *Your AI-powered productivity companion built to prevent last-minute chaos, break down stress, and rescue deadlines.*

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/AI-Gemini%203.5%20Flash-orange.svg)](https://ai.google.dev/)

**Last Minute Life Saver (LMLS)** is an intelligent, full-stack productivity ecosystem designed specifically for high-stress environments. Built via **vibe coding** as an entry for the **Google Vibe2Ship Hackathon**, this project is fully deployed on **Google Cloud Platform (GCP)**. 

Whether you're a student facing finals, a developer in a high-stakes hackathon, or a project manager dealing with scope creep, LMLS acts as an automated triage center. It helps you prioritize complex projects, schedule tasks automatically, generate hyper-personalized actionable productivity insights, and interact using seamless conversational voice controls.

---

## 🚀 Key Features

### 🧠 1. AI-Powered Priority Triage
- Uses Gemini-powered intelligence to parse task titles, descriptions, and deadlines.
- Automatically calculates a numeric urgency/importance index.
- Groups tasks into an Eisenhauer-inspired matrix to prevent decision paralysis.

### 🧩 2. Micro-Task Breakplanner
- Overwhelmed by a massive task? The Breakplanner takes a monolithic goal (e.g., "Build Hackathon MVP") and slices it into highly actionable, time-boxed sub-steps.
- Re-orders milestones logically so you can start executing immediately.

### 📅 3. Smart Autopilot Scheduler
- Automatically constructs an optimal, chronological timeline for your day.
- Packs tasks intelligently based on deadlines, task length, and priority weights.

### 🎙️ 4. Intelligent Voice Assistant
- Hands-busy, keyboard-weary? Speak naturally to your task dashboard.
- Uses advanced Gemini speech-parsing to understand intents (e.g., *"add a high priority task named submit final slides by 5 PM today"*), mapping complex language directly into system data models.

### 📊 5. Hyper-Personalized Productivity Insights
- Evaluates your current completion trends, deadlines, and overdue items.
- Generates proactive, constructive motivational coaching tips and structured action items to optimize your focus flow.

---

## 🛠️ Resilient Full-Stack Architecture
LMLS is engineered with **Zero-Downtime Fallback Design (ZDFD)**. In high-demand hackathon demonstrations or production scenarios where third-party API limits or network quota constraints might trigger, LMLS does not crash.
- **Fail-Safe Heuristic Layer**: The server includes an integrated, rule-based algorithmic parser that mimics Gemini's logical schemas.
- If a `429 Resource Exhausted` or `503 Service Unavailable` API state is caught, LMLS instantly activates local regex, date-parsing, and Priority Matrix formulas.
- Users receive an uninterrupted, responsive, and completely functional experience under any stress test.

---

## 💻 Tech Stack & Dependencies

| Layer | Technologies | Key Role |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Lucide React, Motion | Ultra-snappy, modern, and animated UI |
| **Styling** | Tailwind CSS v4 | High-fidelity, customized Dark/Slate cosmic theme |
| **Data Viz** | Recharts, D3 | Rich analytics, completion trendlines, and velocity graphs |
| **Backend** | Node.js, Express, ESBuild, tsx | API proxying, robust local asset serving, and server-side model calls |
| **AI Integration** | `@google/genai` (Gemini-3.5-Flash) | Natural language processing, scheduling optimization, voice commands |
| **Database** | Stateful, serializable file-based JSON DB | Lightweight, zero-config persistence ideal for rapid container environments |

---

## 📂 Project Structure

```text
├── server/
│   ├── ai.ts            # Gemini SDK configuration, prompt templates, and local heuristics fallbacks
│   └── db.ts            # JSON-based persistent local database model with automatic serialization
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx        # High-impact introduction & hero view
│   │   ├── AuthPage.tsx           # Responsive session login/signup dashboard
│   │   ├── Dashboard.tsx          # Central application layout container
│   │   ├── TaskManager.tsx        # Rich task editor, Eisenhower matrix, and sub-task lists
│   │   ├── Scheduler.tsx          # Dynamic Autopilot day-planner
│   │   ├── GoalsAndHabits.tsx     # Long-term goal setter and streak habit tracker
│   │   ├── CalendarView.tsx       # Timeline schedules and chronological heatmaps
│   │   ├── AnalyticsView.tsx      # Recharts productivity graphs and metric tracking
│   │   ├── VoiceAssistant.tsx     # Micro-permission hands-free input console
│   │   ├── CustomDateTimePicker.tsx # Specialized dark timezone-aware input selector
│   │   └── ProfileView.tsx        # Personalization & productivity metrics
│   ├── lib/
│   │   └── api.ts       # Unified fetch handlers connecting React views with Express API
│   ├── types.ts         # Central TypeScript interfaces & enums
│   ├── App.tsx          # Global navigation Router & state lifecycle manager
│   ├── index.css        # Core custom styles and Tailwind theme mappings
│   └── main.tsx         # Client mounting entry point
├── server.ts            # Main Express entry point with Vite middleware dev capabilities
├── package.json         # Unified package dependencies & CJS bundling build pipeline
└── tsconfig.json        # Strict TypeScript compiler options
```

---

## ⚙️ Getting Started (Local Setup)

### 📋 Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed on your machine.

### 🔧 Installation

1. **Download / Extract Source Code**
   Download the project repository ZIP file from the AI Studio Export menu and extract it on your system.

2. **Install Dependencies**
   Navigate to the project root directory and install npm packages:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (based on `.env.example`):
   ```env
   # .env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3000
   ```
   *(Note: If no API key is specified, the application will automatically run on its high-quality rules-based Local Heuristic Fallback engine!).*

### 🏃 Running the Application

- **Run in Development Mode (with Hot Reloading)**:
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Build for Production**:
  ```bash
  npm run build
  ```
  This command transpiles the Vite frontend assets, bundles the backend `server.ts` into a self-contained CommonJS target (`dist/server.cjs`) using `esbuild`, and ensures error-free execution.

- **Run in Production Mode**:
  ```bash
  npm start
  ```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more details.

---

*Good luck with your Hackathon submission! Built with passion by LMLS developers.*
