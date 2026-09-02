# JobScout AI

AI-Powered Job Search and Resume Matching Platform

Match your resume with tech jobs, see which skills you match, find skill gaps to improve, and track your applications.

---

## Overview

JobScout AI is a web application that helps job seekers find tech positions that match their actual skills and experience.

Instead of scrolling through hundreds of generic job posts or guessing whether your background fits a role, JobScout AI compares your resume directly with job openings. It analyzes your technical background, calculates a clear match percentage from 0% to 100%, lists the skills you already have, and highlights any missing skills so you can prepare before applying.

---

## Why JobScout?

Traditional job boards rely on basic keyword matching. If a job post asks for "React" and your resume mentions "Frontend Developer with React.js experience," basic filters might miss the connection or give you poor results.

JobScout AI improves this process in three simple ways:
1. **Reads your actual resume**: You can upload a PDF or text resume. The app extracts your skills, job titles, and experience level automatically.
2. **Understands meaning, not just keywords**: Using Google Gemini AI embeddings, JobScout compares the meaning of your resume with the full requirements of each job listing.
3. **Shows your skill gaps clearly**: You can see which skills match the job and which skills you are missing, helping you decide where to focus your efforts.

---

## Key Features

### 1. Resume Upload and Parsing
- Upload your resume by dragging and dropping a PDF file or selecting a text file.
- Client-side reading processes your PDF file directly inside the browser using PDF.js.
- Google Gemini AI extracts key details from your resume:
  - Your full name and contact information
  - Your current job title and target job title
  - Your primary technical skills (such as TypeScript, React, Python, or Docker)
  - A short summary of your background and experience level
- You can review and edit any extracted information in your profile at any time.

### 2. Job Matching Engine
- Every job listing receives a calculated match score from 0% to 100%.
- The matching engine compares your resume summary and skill list against the job description and requirements.
- Jobs are automatically sorted so your best matches appear at the top of the list.
- A "Quick Matcher" button lets you re-run the match calculation whenever you update your resume or change your profile settings.

### 3. Skill Gap Analysis
- When viewing a job card or opening the full job details, you get a side-by-side skill comparison:
  - **Matched Skills**: Technical skills that appear on both your resume and the job listing.
  - **Missing Skills**: Requirements listed by the employer that were not detected in your resume.
- This helps you tailor your resume for specific applications and understand what skills to learn next.

### 4. Search and Filters
- **Keyword Search**: Search by job title, company name, technology stack, or location.
- **Category Filter**: Filter jobs by field, including Frontend, Backend, Full-Stack, AI / ML, DevOps, Mobile, and Data.
- **Remote Filter**: Quick toggle to show only fully remote positions.
- **Minimum Match Score**: Set a slider to hide jobs below a chosen match percentage (for example, only show jobs with at least an 80% match).
- **Sorting Options**: Sort jobs by match percentage, highest salary, or most recently posted date.

### 5. Quick Navigation (Command Palette)
- Press `Ctrl + K` (on Windows/Linux) or `Cmd + K` (on macOS) anywhere in the application to open the Command Palette.
- Quickly search for jobs, jump between pages (Dashboard, Profile, Analytics, Settings), toggle filters, or run the matcher without touching your mouse.

### 6. User Profile Management
- Customize your target job title, preferred work style (Remote, Hybrid, or On-site), location, and minimum expected salary.
- Add, edit, or remove individual skill tags to refine your match calculations.
- Optional user sign-in via Supabase lets you save your profile and preferences across sessions.

### 7. Application Tracking and Analytics
- Click "Apply" on any job listing to open the employer's official job application page.
- Track how many jobs you have reviewed, how many applications you have started, and your overall top match score.
- The Analytics view provides simple statistics on your job search progress.

---

## How the Matching System Works

The matching system runs in four simple steps:

1. **Step 1: Reading Your Resume**  
   When you upload your PDF or text file, the app reads the raw text. If an AI key is configured, Google Gemini parses the text into structured data (skills, title, experience). If you prefer offline mode, the app uses built-in pattern matching to detect common tech skills.

2. **Step 2: Generating Vector Embeddings**  
   The system converts your resume profile into a mathematical representation called a vector embedding (using Gemini's 768-dimension text embedding model). This captures the full context of your experience rather than just individual words.

3. **Step 3: Comparing with Jobs**  
   Job descriptions are also stored with their vector embeddings. The system calculates the cosine similarity between your profile vector and each job vector, producing a similarity score.

4. **Step 4: Combining Vector Similarity and Skill Overlap**  
   The final match score combines two factors:
   - The overall contextual similarity between your profile and the job description.
   - The exact percentage of required skills that you currently have.  
   This ensures high scores reflect both overall role relevance and specific technical requirement fit.

---

## Technology Stack

| Component | Tool / Library | Purpose |
| :--- | :--- | :--- |
| Frontend Framework | React 19 with TypeScript | Builds the user interface with strong type safety. |
| Build Tool | Vite 6 | Fast local development server and production bundler. |
| Styling | Tailwind CSS v4 | Clean, responsive dark-mode styling. |
| Icons | Lucide React | Lightweight icons used across navigation and cards. |
| Animations | Motion (`motion/react`) | Smooth page transitions and dialog animations. |
| AI and Embeddings | Google Gen AI SDK (`@google/genai`) | Resume parsing and semantic vector generation. |
| Document Parsing | PDF.js (`pdfjs-dist`) | Reads text from uploaded PDF resumes directly in the browser. |
| Database and Auth | Supabase (`@supabase/supabase-js`) | Stores job listings, user profiles, and vector embeddings. |
| Celebrations | Canvas Confetti | Visual feedback when submitting an application. |

---

## Project Structure

```text
jobscout/
├── public/                     # Static files, icons, and logos
├── src/
│   ├── components/             # React user interface components
│   │   ├── ui/                 # Reusable UI primitives (buttons, inputs, dialogs)
│   │   ├── AnalyticsOverview.tsx    # Statistics and application progress view
│   │   ├── CommandPalette.tsx       # Quick keyboard command menu (Ctrl+K / Cmd+K)
│   │   ├── FilterBar.tsx            # Search bar, category filters, and sorting controls
│   │   ├── JobCard.tsx              # Individual job post card with match badge
│   │   ├── JobDetailModal.tsx       # Full popup modal with detailed job description
│   │   ├── JobExplorerDashboard.tsx # Main dashboard containing job grid and filters
│   │   ├── LandingPage.tsx          # Public home page with hero section and features
│   │   ├── OnboardingUpload.tsx     # Resume upload drop area and parsing status
│   │   ├── ProfileManagement.tsx    # Profile editor for skills, salary, and preferences
│   │   ├── QuickMatcherHero.tsx     # Top banner action to re-run AI matching
│   │   ├── SettingsModal.tsx        # Application settings and API key controls
│   │   ├── Sidebar.tsx              # Main navigation menu for the dashboard
│   │   ├── SignInPage.tsx           # User sign-in view
│   │   └── TopHeader.tsx            # Sticky top bar with quick actions and profile link
│   ├── lib/                    # Helper libraries and external services
│   │   ├── ai.ts               # Google Gemini API client for parsing and embeddings
│   │   ├── confetti.ts         # Application submission confetti effect helper
│   │   ├── ingestion.ts        # Helper functions to scrape or ingest job listings
│   │   ├── matcher.ts          # Core matching logic (combines AI vectors + skill overlap)
│   │   ├── supabase.ts         # Supabase database client and database queries
│   │   └── utils.ts            # General utility functions (class name merger, formatters)
│   ├── types.ts                # TypeScript data interfaces for jobs, profiles, and filters
│   ├── App.tsx                 # Main root component coordinating views and state
│   ├── index.css               # Global styling, design variables, and font declarations
│   └── main.tsx                # Application entry point
├── supabase/
│   ├── schema.sql              # Database schema, tables, vector extensions, and RPC functions
│   └── functions/              # Optional Supabase serverless edge functions
├── .env.example                # Example template for environment variables
├── package.json                # Project dependencies and script commands
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite server and bundler configuration
```

---

## Getting Started

Follow these steps to run JobScout AI on your local computer.

### Prerequisites

Make sure you have installed:
- **Node.js**: Version 18.0.0 or higher (check your version using `node -v`).
- **Package Manager**: `npm` (comes with Node), `pnpm`, or `bun`.
- A modern web browser such as Chrome, Firefox, Edge, or Safari.

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/jobscout.git
   cd jobscout
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your environment variables**:
   Make a copy of the `.env.example` file and name it `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Add your keys to `.env`**:
   Open `.env` in your text editor and fill in the values described below.

---

## Environment Variables Explained

Here is an explanation of every variable in `.env`:

| Variable Name | Required? | What It Is and Where to Find It |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Optional | The URL of your Supabase project (for example: `https://xyzcompany.supabase.co`). Found in your Supabase project settings under API. |
| `VITE_SUPABASE_ANON_KEY` | Optional | The public anonymous key for your Supabase project. Also found in your Supabase project settings under API. |
| `VITE_GEMINI_KEY` | Recommended | Your Google Gemini API key. Used to parse resumes and create semantic vector embeddings. You can get a free key from Google AI Studio (https://aistudio.google.com). |
| `ADZUNA_APP_ID` | Optional | Application ID from Adzuna if you want to pull live external job postings from the Adzuna Job API. |
| `ADZUNA_APP_KEY` | Optional | API Secret Key from Adzuna paired with `ADZUNA_APP_ID`. |

> Note: If you do not provide Supabase or Gemini keys right away, JobScout AI still runs in guest mode with sample tech jobs and built-in skill extraction so you can test all features immediately.

---

## Setting Up the Database (Supabase)

If you want to save your profiles and job listings in Supabase:

1. Create a free account at [supabase.com](https://supabase.com) and create a new project.
2. In your Supabase dashboard, go to the **SQL Editor** on the left menu.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repository.
4. Copy all the SQL code and paste it into the Supabase SQL Editor, then click **Run**.
   - This enables the `pgvector` extension.
   - This creates the `jobs` table and `profiles` table.
   - This creates the vector index and the `match_jobs_for_user` search function.
5. Copy your project URL and anonymous API key from **Project Settings > API** into your `.env` file.

---

## Running the Application

Start the local development server:

```bash
npm run dev
```

The terminal will display your local server address. Open your browser and visit:

```
http://localhost:3000
```

---

## Usage Guide

1. **Start on the Landing Page**:
   - Browse the homepage overview and click **Sign In** or **Explore Demo** to jump into the dashboard.

2. **Upload Your Resume**:
   - In the dashboard, click **Upload Resume** in the navigation bar or use the onboarding panel.
   - Select your `.pdf` or `.txt` resume file.
   - Wait a moment while the system parses your resume text and detects your skills.

3. **Check Your Profile**:
   - Open the **Profile** tab from the left sidebar to verify your extracted skills, target title, and location.
   - Add any additional skills or adjust your minimum salary requirement.

4. **Review Matched Jobs**:
   - Go to the **Job Explorer** tab.
   - Each job shows a percentage match score, such as "94% Match".
   - Green tags indicate skills you already have.
   - Outlined tags show skills you do not have yet.

5. **Filter and Refine**:
   - Type in the search box to find specific roles or companies.
   - Use category buttons (Frontend, Backend, AI / ML, DevOps) to narrow the list.
   - Turn on the "Remote Only" switch if you only want work-from-home roles.

6. **View Details and Apply**:
   - Click any job card to open the full job description.
   - Review the requirements, compensation, and skill breakdown.
   - Click **Apply on Company Site** to open the real application page.

---

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Vite development server on port 3000 with hot module reloading.
- `npm run build`: Compiles TypeScript and packages the application into the `dist/` directory for production deployment.
- `npm run preview`: Starts a local server to test the production build before deploying.
- `npm run lint`: Runs the TypeScript compiler (`tsc --noEmit`) to verify that there are no type errors.

---

## Security and Privacy

- **Local PDF Processing**: When you upload a resume, its text is extracted locally inside your web browser using PDF.js. Your raw resume file is not uploaded to third-party file storage.
- **Protected Credentials**: All secret keys and API keys are stored in your local `.env` file, which is ignored by Git and never committed to version control.
- **Database Safety**: If you use Supabase, database tables use Row Level Security (RLS) policies so users can only access their own profile data.

---

## License

This project is licensed under the [MIT License](LICENSE).
