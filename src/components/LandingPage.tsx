import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  UploadCloud,
  Search,
  Target,
  Briefcase,
  DollarSign,
  ShieldCheck,
  FileText,
  ExternalLink,
  ChevronRight,
  Zap,
  Check,
  X
} from 'lucide-react';
import { JobScoutLogo } from './JobScoutLogo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LandingPageProps {
  onGoToSignIn: () => void;
  onExploreDemo?: () => void;
  totalJobsCount?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToSignIn,
}) => {
  const sampleJobs = [
    {
      company: 'Anthropic',
      location: 'San Francisco, CA (Hybrid / Remote)',
      title: 'Full-Stack Engineer, AI Platforms',
      match: 98,
      salary: '$180,000 – $240,000',
      matchedSkills: ['TypeScript', 'React', 'Node.js', 'API Design'],
      missingSkills: ['Kubernetes']
    },
    {
      company: 'Linear',
      location: 'Remote (Worldwide)',
      title: 'Senior Frontend Developer',
      match: 94,
      salary: '$160,000 – $210,000',
      matchedSkills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
      missingSkills: ['WebSockets']
    },
    {
      company: 'Supabase',
      location: 'Remote (Americas / EMEA)',
      title: 'Backend Systems Engineer',
      match: 89,
      salary: '$150,000 – $195,000',
      matchedSkills: ['PostgreSQL', 'TypeScript', 'Go'],
      missingSkills: ['Rust']
    }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#ededed] flex flex-col selection:bg-[#c8c2ac] selection:text-black overflow-x-clip w-full max-w-full">
      {/* 1. Header Navigation - Minimal & Spacious */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1c1c1c] bg-[#000000]/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-white shrink-0">
              <JobScoutLogo className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              JobScout
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="default"
              size="sm"
              onClick={onGoToSignIn}
              id="landing-header-signin-btn"
              className="bg-white text-black hover:bg-neutral-200 font-semibold text-xs px-4 h-9 rounded-md transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section - Balanced spacing, no horizontal overflow */}
      <section className="relative mx-auto w-full max-w-5xl pt-10 sm:pt-14 pb-16 px-4 sm:px-8 flex-1 overflow-x-hidden">
        {/* Subtle Ambient Glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 size-full overflow-hidden pointer-events-none"
        >
          <div
            className={cn(
              "absolute inset-0 isolate -z-10",
              "bg-[radial-gradient(25%_60%_at_50%_0%,rgba(255,255,255,0.06),transparent)]"
            )}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          {/* Minimal Status Pill */}
          <div
            className={cn(
              "inline-flex items-center rounded-full border border-[#262626] bg-[#0c0c0c] px-3.5 py-1 shadow-sm",
              "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards duration-500 ease-out"
            )}
          >
            <span className="text-xs text-neutral-300 font-medium">
              Match jobs to resume
            </span>
          </div>

          {/* Main Headline */}
          <h1
            className={cn(
              "text-balance font-medium text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.12]",
              "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-100 duration-500 ease-out"
            )}
          >
            Find the tech jobs you're actually qualified for
          </h1>

          {/* Plain, simple description */}
          <p
            className={cn(
              "text-neutral-400 text-base sm:text-lg leading-relaxed max-w-2xl",
              "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-200 duration-500 ease-out"
            )}
          >
            JobScout scans active tech job openings and compares them directly to your resume.
            You get an instant match score for every role, see what skills you have, and know exactly what to prepare before applying.
          </p>

          {/* Primary Action - Single Google Sign In */}
          <div className="fade-in slide-in-from-bottom-10 flex flex-col sm:flex-row items-center justify-center gap-4 fill-mode-backwards pt-4 delay-300 duration-500 ease-out w-full sm:w-auto">
            <Button
              variant="default"
              size="lg"
              onClick={onGoToSignIn}
              id="hero-signin-google-btn"
              className="h-12 px-7 bg-white text-black hover:bg-neutral-200 font-semibold rounded-lg text-sm gap-3 shadow-lg shadow-white/5 transition-all w-full sm:w-auto"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Get Started with Google</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Quick trust line */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#c8c2ac]" />
              Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#c8c2ac]" />
              No spam recruiters
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-[#c8c2ac]" />
              Private & secure
            </span>
          </div>
        </div>

        {/* 3. Full-View Dashboard Preview */}
        <div className="relative mt-12 sm:mt-16 w-full max-w-full">
          {/* Subtle soft backdrop blur behind the container */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent,transparent)] blur-2xl pointer-events-none"
          />

          {/* Outer Framed Screen Container */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-[#222222] bg-[#0c0c0c] p-2 sm:p-3 shadow-2xl ring-1 ring-white/5 overflow-hidden group">
            {/* App Bar Window Controls */}
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 mb-2 bg-[#000000] rounded-xl border border-[#1a1a1a]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80" />
                <span className="ml-2 text-xs font-mono text-neutral-500 truncate max-w-[160px] sm:max-w-none">
                  jobscout.app/dashboard
                </span>
              </div>
            </div>

            {/* Dashboard Image */}
            <div className="relative rounded-xl overflow-hidden border border-[#1c1c1c] bg-[#000000]">
              <img
                src="/jobscout-dashboard.png"
                alt="JobScout Dashboard"
                className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.008]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: How It Works (Simple 3 Steps) */}
      <section className="py-20 sm:py-28 border-t border-[#1a1a1a] bg-[#050505] px-4 sm:px-8 overflow-x-hidden w-full max-w-full">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-[#111111] border border-[#222222] text-xs font-semibold text-[#c8c2ac] uppercase tracking-wider font-mono">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              How JobScout Works
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              No endless search filters or guessing what recruiters want. Three straightforward steps to your next opportunity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {[
              {
                step: '01',
                icon: UploadCloud,
                title: 'Add Your Resume',
                desc: 'Upload your PDF or paste your current job title and skills. JobScout extracts your technical experience in seconds.'
              },
              {
                step: '02',
                icon: Search,
                title: 'We Scout Active Roles',
                desc: 'JobScout continually indexes verified engineering and tech jobs from high-growth startups and top technology leaders.'
              },
              {
                step: '03',
                icon: Target,
                title: 'Get Fit Scores & Apply',
                desc: 'See exactly how well your skills match each job, what technologies you are missing, and apply directly.'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-2xl bg-[#090909] border border-[#1f1f1f] relative space-y-4 flex flex-col justify-between hover:border-[#333] transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#242424] flex items-center justify-center text-[#c8c2ac]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-2xl font-bold text-neutral-700">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: What JobScout Does For You (Practical Features) */}
      <section className="py-20 sm:py-28 border-t border-[#1a1a1a] bg-[#000000] px-4 sm:px-8 overflow-x-hidden w-full max-w-full">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-[#111111] border border-[#222222] text-xs font-semibold text-[#c8c2ac] uppercase tracking-wider font-mono">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Everything JobScout does for you
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Designed to eliminate the uncertainty and repetitive busywork of searching for tech positions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'Honest Match Percentages',
                desc: 'See an immediate 0% to 100% score for every position so you know whether a role is worth your time before applying.'
              },
              {
                icon: FileText,
                title: 'Skill Gap Breakdown',
                desc: 'Find out exactly which languages, libraries, or tools the job mentions that are not yet on your resume.'
              },
              {
                icon: DollarSign,
                title: 'Salary Transparency',
                desc: 'Clear compensation benchmarks for every listing to ensure you never waste time interviewing below your market value.'
              },
              {
                icon: Briefcase,
                title: 'Remote & Hybrid Filters',
                desc: 'Quickly isolate 100% remote roles, US-only listings, or global opportunities with a single click.'
              },
              {
                icon: ExternalLink,
                title: 'Direct Application Links',
                desc: 'No duplicate job boards or spam redirects. Go straight to the verified hiring portal.'
              },
              {
                icon: ShieldCheck,
                title: 'Private to Your Account',
                desc: 'Your resume text and contact information are strictly private to you. No public visibility or recruiter spam.'
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#1c1c1c] space-y-3 hover:border-[#2a2a2a] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center text-[#c8c2ac]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: Why JobScout Beats Traditional Job Boards */}
      <section className="py-20 sm:py-28 border-t border-[#1a1a1a] bg-[#050505] px-4 sm:px-8 overflow-x-hidden w-full max-w-full">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-[#111111] border border-[#222222] text-xs font-semibold text-[#c8c2ac] uppercase tracking-wider font-mono">
              The Difference
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              A smarter way to discover jobs
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Why relying on manual keyword searches on generic boards slows your job hunt down.
            </p>
          </div>

          {/* Side by Side Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Traditional Boards */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#090909] border border-[#222] space-y-6">
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-4">
                <span className="text-xs font-mono uppercase text-neutral-500">Traditional Job Boards</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-950/40 text-red-400 border border-red-900/30">
                  Manual & Frustrating
                </span>
              </div>
              <ul className="space-y-4 text-sm text-neutral-400">
                <li className="flex items-start gap-3">
                  <X className="size-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Relies on exact keyword matches; misses great jobs with slightly different titles.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="size-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Endless sponsored spam and promoted listings burying recent openings.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="size-4 text-red-400 shrink-0 mt-0.5" />
                  <span>No feedback on why you're a good fit or which skills you lack.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="size-4 text-red-400 shrink-0 mt-0.5" />
                  <span>Hours spent copying requirements into spreadsheets by hand.</span>
                </li>
              </ul>
            </div>

            {/* With JobScout */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0d0d0d] border border-[#2c2c2c] space-y-6 ring-1 ring-white/5">
              <div className="flex items-center justify-between border-b border-[#222] pb-4">
                <span className="text-xs font-mono uppercase text-[#c8c2ac]">With JobScout</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                  Automated & Fast
                </span>
              </div>
              <ul className="space-y-4 text-sm text-neutral-300">
                <li className="flex items-start gap-3">
                  <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Understands your actual background and matches on concepts, not just keywords.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Ranked from highest match to lowest so you review the most relevant roles first.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Clear skill breakdowns identify exactly what technologies to brush up on.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Direct links to original job postings with transparent salary indications.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Call to Action Box */}
          <div className="p-6 sm:p-10 rounded-2xl bg-[#0a0a0a] border border-[#222] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Ready to see your job matches?</h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                Sign in with Google, upload your resume, and discover your top roles in seconds.
              </p>
            </div>
            <Button
              variant="default"
              size="lg"
              onClick={onGoToSignIn}
              id="cta-bottom-signin-btn"
              className="bg-white text-black hover:bg-neutral-200 font-semibold px-6 h-11 rounded-lg text-sm shrink-0"
            >
              <span>Get Started Free</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Complete Footer Section */}
      <footer className="border-t border-[#1c1c1c] bg-[#000000] text-neutral-400 px-4 sm:px-8 py-12 sm:py-16 overflow-x-hidden w-full max-w-full">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <JobScoutLogo className="w-6 h-6 text-white" />
                <span className="text-lg font-bold text-white">JobScout</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                Smart tech job discovery. Match your resume directly to verified openings from top technology teams worldwide.
              </p>
              <div className="pt-2 text-xs text-neutral-500">
                <p>Architecture: Cloud vector search & real-time automated scraper.</p>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Product
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li>
                  <button onClick={onGoToSignIn} className="hover:text-white transition-colors cursor-pointer">
                    Resume Matcher
                  </button>
                </li>
                <li>
                  <button onClick={onGoToSignIn} className="hover:text-white transition-colors cursor-pointer">
                    Tech Job Explorer
                  </button>
                </li>
                <li>
                  <button onClick={onGoToSignIn} className="hover:text-white transition-colors cursor-pointer">
                    Skill Gap Analysis
                  </button>
                </li>
                <li>
                  <button onClick={onGoToSignIn} className="hover:text-white transition-colors cursor-pointer">
                    Salary Insights
                  </button>
                </li>
              </ul>
            </div>

            {/* Account & Access */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
                Access
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li>
                  <button onClick={onGoToSignIn} className="hover:text-white transition-colors cursor-pointer">
                    Sign In with Google
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-[#181818] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <p>© {new Date().getFullYear()} JobScout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
