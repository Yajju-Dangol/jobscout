# JobScout AI

> **AI-Powered Job Scraping & Semantic Vector Resume Matching Dashboard**  
> Match your resume against curated tech opportunities, analyze skill overlaps, and apply with confidence.

---

## 🌟 Overview

**JobScout AI** bridges the gap between your resume and real-world tech job openings. Utilizing semantic vector analysis and intelligent parsing powered by Gemini and vector embeddings, JobScout scores job listings against your unique skill set, highlights exact matches, surfaces skill gaps, and surfaces high-affinity roles in a sleek, minimalist interface.

---

## ✨ Features

- **Semantic Resume Ingestion**:
  - Drag-and-drop or upload PDF and text resumes.
  - Automatically extracts target roles, years of experience, core technical skills, and candidate bios using client-side parsing and AI.
- **Intelligent Job Matching Engine**:
  - Calculate real-time semantic similarity percentages between candidate profiles and job requirements.
  - On-demand Quick Matcher: evaluate match scores and detailed skill alignment at the click of a button.
- **Visual Skills Gap Breakdown**:
  - Identify confirmed matching skills directly on job cards and in the job details modal.
  - Highlight missing competencies and recommended skills to prepare for interviews.
- **Filter & Search Explorer**:
  - Filter by remote status, compensation range, experience level, contract type, and keywords.
  - Interactive Command Palette (`Cmd + K` or `Ctrl + K`) for rapid keyboard navigation and instant job search.
- **Modern Minimalist UI**:
  - Inspired by Linear and Raycast design systems with deep dark tones, crisp typography, and responsive layouts.
  - Delightful user feedback including micro-animations via `motion/react` and celebratory confetti on application submission.
- **User Profile Management**:
  - Save and customize target titles, salary expectations, preferred locations, and custom skill tags.
  - Persistent state and optional multi-user authentication integration via Supabase.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Animations** | [Motion](https://motion.dev/) (`motion/react`) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **AI & Embeddings** | [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) |
| **Document Parsing** | [PDF.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`) |
| **Backend / Database** | [Supabase](https://supabase.com/) (`@supabase/supabase-js`) |
| **Effects** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) |

---

## 📁 Project Structure

```text
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Modular React components
│   │   ├── AnalyticsOverview.tsx    # Application stats and metrics
│   │   ├── CommandPalette.tsx       # Quick keyboard command bar (Cmd/Ctrl + K)
│   │   ├── FilterBar.tsx            # Search and faceted filter controls
│   │   ├── JobCard.tsx              # Job listing card component
│   │   ├── JobDetailModal.tsx       # Full job specifications & requirements
│   │   ├── JobExplorerDashboard.tsx # Main job browse view
│   │   ├── LandingPage.tsx          # Marketing landing page
│   │   ├── Navbar.tsx / TopHeader   # Navigation bars and action buttons
│   │   ├── OnboardingUpload.tsx     # Resume upload dropzone modal
│   │   ├── ProfileManagement.tsx    # Candidate profile & preferences editor
│   │   ├── QuickMatcherHero.tsx     # Quick matcher action panel
│   │   ├── SettingsModal.tsx        # Preference configuration dialog
│   │   ├── Sidebar.tsx              # Dashboard sidebar navigation
│   │   └── SignInPage.tsx           # Authentication view
│   ├── lib/                         # Supabase and utility client helpers
│   ├── utils/                       # Resume parsing and mock scraping generators
│   ├── types.ts                     # TypeScript data contracts and types
│   ├── App.tsx                      # Root application layout and state coordinator
│   └── main.tsx                     # Vite application entry point
├── supabase/                        # Database migration scripts & schemas
├── .env.example                     # Sample environment variable declarations
├── package.json                     # Project manifest and dependencies
└── vite.config.ts                   # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm**, **pnpm**, or **bun**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/jobscout-ai.git
   cd jobscout-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Fill in your configuration keys:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"

   # Gemini API Key (for semantic skill extraction)
   VITE_GEMINI_KEY="your-gemini-api-key"

   # Optional External Job Board API Keys (e.g., Adzuna)
   ADZUNA_APP_ID=""
   ADZUNA_APP_KEY=""
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📖 Usage Guide

1. **Upload Resume**:
   - Navigate to the upload prompt or click **Upload Resume** in the navigation bar.
   - Select or drag a `.pdf` or `.txt` resume file.
   - JobScout extracts your technical skills, experience level, and role preferences.
2. **Explore Roles**:
   - Browse the curated catalog of technology positions.
   - Use the filter controls to adjust location, salary expectations, or remote preferences.
3. **Run Quick Matcher**:
   - Click **Run Quick Matcher** in the banner or on any job card.
   - The engine computes semantic match scores, reveals the percentage match badges, and displays overlapping vs. missing skills.
4. **Apply & Track**:
   - Click **Apply** on any card to navigate directly to the company's application portal.
   - Submitted applications are saved to your application tracker.

---

## 📜 Available Scripts

- `npm run dev` — Starts the Vite development server on port 3000.
- `npm run build` — Bundles the production-ready application into `dist/`.
- `npm run preview` — Locally previews the production build.
- `npm run lint` — Runs TypeScript type-checking (`tsc --noEmit`).

---

## 🔒 Security & Privacy

- Resume parsing takes place locally in your browser session.
- Sensitive credentials and keys are kept in environment variables and are never checked into version control.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
