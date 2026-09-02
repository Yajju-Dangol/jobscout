import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { CommandPalette } from './components/CommandPalette';
import { SettingsModal } from './components/SettingsModal';
import { JobExplorerDashboard } from './components/JobExplorerDashboard';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { OnboardingUpload } from './components/OnboardingUpload';
import { ProfileManagement } from './components/ProfileManagement';
import { JobDetailModal } from './components/JobDetailModal';
import { LandingPage } from './components/LandingPage';
import { SignInPage } from './components/SignInPage';
import { Job, UserProfile, ViewTab, FilterState, AuthUser } from './types';
import { Sparkles } from 'lucide-react';
import { triggerConfetti } from './lib/confetti';

// Serverless Supabase & AI Services
import { 
  loadProfileFromSupabase, 
  saveProfileToSupabase, 
  clearJobsFromSupabase,
  getActiveAuthUser,
  signOutUser,
  getSupabaseClient
} from './lib/supabase';
import { matchJobsForCandidate } from './lib/matcher';
import { scrapeAndIngestJobs } from './lib/ingestion';
import { generateCandidateQueryEmbedding } from './lib/ai';

const createBlankGoogleProfile = (user: AuthUser): UserProfile => ({
  id: user.id,
  fullName: user.name || (user.email ? user.email.split('@')[0] : 'Google Candidate'),
  currentTitle: '',
  email: user.email || '',
  avatarUrl: user.avatarUrl,
  targetJobTitle: '',
  workStyle: '',
  location: '',
  minSalary: '',
  skills: [],
  resumeText: '',
  lastUploadedFileName: '',
  uploadDate: '',
  resumeSummary: '',
  vectorDimensions: 768,
  lastMatchedAt: '',
});

export default function App() {
  // Multi-User View Routing: 'landing' | 'signin' | 'dashboard'
  const [authView, setAuthView] = useState<'landing' | 'signin' | 'dashboard'>('landing');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Navigation State inside dashboard - defaults to 'upload' for first-time onboarding
  const [currentTab, setCurrentTab] = useState<ViewTab>('upload');

  // Sidebar Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Command Palette & Settings Modal States
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // User Profile State (synced with Supabase per authenticated user)
  const [profile, setProfile] = useState<UserProfile>(() => 
    createBlankGoogleProfile({ id: 'guest', name: 'Guest Candidate' })
  );

  // Jobs State (synced with Supabase)
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Matcher animation state & execution flag
  const [isMatching, setIsMatching] = useState(false);
  const [hasRunMatcher, setHasRunMatcher] = useState(false);
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);

  // Selected Job for Deep-Dive Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All Categories',
    remoteOnly: false,
    minSimilarity: 0,
    sortBy: 'similarity'
  });

  // Load database jobs for guest / unauthenticated preview
  const loadGuestJobs = async () => {
    setIsLoading(true);
    try {
      const matchResult = await matchJobsForCandidate({
        userId: 'guest',
        overrideProfile: {
          title: profile.targetJobTitle || profile.currentTitle,
          skills: profile.skills,
          rawText: profile.resumeText,
        },
      });

      if (matchResult.jobs && matchResult.jobs.length > 0) {
        setJobs(matchResult.jobs);
      } else {
        await scrapeAndIngestJobs();
        const refreshed = await matchJobsForCandidate({ userId: 'guest' });
        setJobs(refreshed.jobs);
      }
    } catch (err) {
      console.error('[Load Guest Jobs Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Always scroll viewport to the top whenever switching tabs or views
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [currentTab, authView]);

  // 1. Listen for Supabase OAuth redirect & initial session
  useEffect(() => {
    async function initAuth() {
      try {
        const user = await getActiveAuthUser();
        if (user) {
          setAuthUser(user);
          setAuthView('dashboard');
          const hasOnboardedKey = `jobscout_has_onboarded_${user.id}`;
          if (localStorage.getItem(hasOnboardedKey) !== 'true') {
            setCurrentTab('upload');
          }
          await loadUserData(user);
        } else {
          // If unauthenticated, default to landing page and load guest data in background
          setAuthView('landing');
          await loadGuestJobs();
        }
      } catch (err) {
        console.warn('[Auth Initialization Note]:', err);
      } finally {
        setIsLoading(false);
      }
    }

    // Subscribe to Supabase auth state change
    const supabase = getSupabaseClient();
    let authListener: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const u = session.user;
          const name =
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.user_metadata?.given_name ||
            (u.email ? u.email.split('@')[0] : 'Google User');
          const authenticatedUser: AuthUser = {
            id: u.id,
            email: u.email,
            name,
            avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture,
          };
          setAuthUser(authenticatedUser);
          setAuthView('dashboard');
          const hasOnboardedKey = `jobscout_has_onboarded_${authenticatedUser.id}`;
          if (localStorage.getItem(hasOnboardedKey) !== 'true') {
            setCurrentTab('upload');
          }
          await loadUserData(authenticatedUser);
        } else if (event === 'SIGNED_OUT') {
          setAuthUser(null);
          setAuthView('landing');
          setCurrentTab('upload');
        }
      });
      authListener = data?.subscription;
    }

    initAuth();

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // Load database jobs & user profile for a specific authenticated user
  const loadUserData = async (user: AuthUser) => {
    setIsLoading(true);
    try {
      // 1. Load user profile from Supabase
      const dbProf = await loadProfileFromSupabase(user.id);
      let activeUserProfile: UserProfile;

      const hasOnboardedKey = `jobscout_has_onboarded_${user.id}`;
      const hasUploadedResume = Boolean(
        dbProf && 
        dbProf.raw_text && 
        dbProf.raw_text.trim().length > 0 &&
        Array.isArray(dbProf.skills) && 
        dbProf.skills.length > 0
      );
      const isFirstTimeLogin = !dbProf || !hasUploadedResume || localStorage.getItem(hasOnboardedKey) !== 'true';

      if (isFirstTimeLogin) {
        // First-time users are routed straight to the Upload Resume page
        setCurrentTab('upload');
      } else {
        localStorage.setItem(hasOnboardedKey, 'true');
        setCurrentTab('jobs');
      }

      if (dbProf) {
        activeUserProfile = {
          id: user.id,
          fullName: dbProf.full_name || user.name || 'Google Candidate',
          currentTitle: dbProf.title || '',
          email: user.email || '',
          avatarUrl: user.avatarUrl,
          targetJobTitle: dbProf.title || '',
          workStyle: '',
          location: '',
          minSalary: '',
          skills: Array.isArray(dbProf.skills) ? dbProf.skills : [],
          resumeText: dbProf.raw_text || '',
          lastUploadedFileName: dbProf.raw_text ? 'Resume.pdf' : '',
          uploadDate: dbProf.updated_at ? new Date(dbProf.updated_at).toLocaleDateString() : '',
          resumeSummary: '',
          vectorDimensions: 768,
          lastMatchedAt: 'Active',
        };
        setProfile(activeUserProfile);
      } else {
        // First-time Google user: name is filled with Google name, all other fields blank
        activeUserProfile = createBlankGoogleProfile(user);
        setProfile(activeUserProfile);

        // Explicitly create a new user profile record in the Supabase database
        try {
          await saveProfileToSupabase({
            id: user.id,
            fullName: activeUserProfile.fullName,
            title: activeUserProfile.targetJobTitle || activeUserProfile.currentTitle || '',
            skills: activeUserProfile.skills,
            rawText: '',
            embedding: null,
          });
        } catch (createErr) {
          console.warn('[Create user profile in Supabase note]:', createErr);
        }
      }

      // 2. Load & match vectorized jobs for this specific candidate
      const matchResult = await matchJobsForCandidate({
        userId: user.id,
        overrideProfile: dbProf ? {
          title: dbProf.title || undefined,
          skills: dbProf.skills || undefined,
          rawText: dbProf.raw_text || undefined,
        } : undefined,
      });

      if (matchResult.jobs && matchResult.jobs.length > 0) {
        setJobs(matchResult.jobs);
      } else {
        await scrapeAndIngestJobs();
        const refreshed = await matchJobsForCandidate({ userId: user.id });
        setJobs(refreshed.jobs);
      }
    } catch (err) {
      console.error('[Load User Data Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle successful authentication from SignInPage
  const handleAuthSuccess = async (user: AuthUser) => {
    setAuthUser(user);
    setAuthView('dashboard');
    const hasOnboardedKey = `jobscout_has_onboarded_${user.id}`;
    if (localStorage.getItem(hasOnboardedKey) !== 'true') {
      setCurrentTab('upload');
    }
    showToast(`Welcome, ${user.name || 'Candidate'}!`, 'Signed in with Google. Upload your resume to start AI matching.');
    await loadUserData(user);
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOutUser();
    setAuthUser(null);
    setAuthView('landing');
    setCurrentTab('upload');
    showToast('Signed Out', 'You have been signed out successfully.');
  };

  // Developer Action: Trigger Live Scraper & Vector Indexing into Supabase
  const handleDeveloperFetchJobs = async () => {
    setIsFetchingJobs(true);
    showToast('Job Scraper Triggered', 'Scraping feeds & calculating 768-dim embeddings into Supabase...');
    try {
      const telemetry = await scrapeAndIngestJobs();
      
      // Refresh matches from Supabase
      const matchResult = await matchJobsForCandidate({
        overrideProfile: {
          title: profile.targetJobTitle || profile.currentTitle,
          skills: profile.skills,
          rawText: profile.resumeText,
        },
      });
      setJobs(matchResult.jobs);

      showToast(
        'Supabase Jobs Synced',
        `Ingested ${telemetry.newIngested} new postings (${telemetry.duplicatesSkipped} duplicates skipped) in ${telemetry.durationMs}ms.`
      );
    } catch (err: any) {
      console.error('[Developer Fetch Error]:', err);
      showToast('Error', err.message || 'Scraper request failed.');
    } finally {
      setIsFetchingJobs(false);
    }
  };

  // Developer Action: Clear all jobs in Supabase DB
  const handleDeveloperClearJobs = async () => {
    try {
      await clearJobsFromSupabase();
      setJobs([]);
      showToast('Database Cleared', 'All job listings have been removed from Supabase.');
    } catch (err: any) {
      console.error('[Clear Jobs Error]:', err);
      showToast('Error', 'Failed to clear jobs.');
    }
  };

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (authView === 'dashboard') {
          setCommandPaletteOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authView]);

  // Save profile to Supabase and refresh vector rankings
  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    const targetUserId = authUser?.id || updatedProfile.id || profile.id;
    if (targetUserId && updatedProfile.resumeText && updatedProfile.resumeText.trim().length > 0) {
      localStorage.setItem(`jobscout_has_onboarded_${targetUserId}`, 'true');
    }
    const profileWithId: UserProfile = { ...updatedProfile, id: targetUserId };
    setProfile(profileWithId);
    
    try {
      // 1. Generate new 768-dim query embedding using Gemini Embedding 2
      const embedding = await generateCandidateQueryEmbedding({
        title: updatedProfile.targetJobTitle || updatedProfile.currentTitle,
        skills: updatedProfile.skills,
        rawText: updatedProfile.resumeText,
        summary: updatedProfile.resumeSummary,
      });

      // 2. Persist directly to Supabase with authenticated user ID
      await saveProfileToSupabase({
        id: targetUserId,
        fullName: updatedProfile.fullName,
        title: updatedProfile.targetJobTitle || updatedProfile.currentTitle || '',
        skills: updatedProfile.skills || [],
        rawText: updatedProfile.resumeText || '',
        embedding,
      });

      // 3. Recalculate vector match scores for this user
      const matchResult = await matchJobsForCandidate({
        userId: targetUserId,
        overrideProfile: {
          title: updatedProfile.targetJobTitle || updatedProfile.currentTitle,
          skills: updatedProfile.skills,
          rawText: updatedProfile.resumeText,
        },
      });

      setJobs(matchResult.jobs);
      showToast('Profile Saved to Supabase', 'Updated candidate skills and recalculated vector match index.');
    } catch (err: any) {
      console.error('[Save Profile Error]:', err);
      showToast('Save Notification', err.message || 'Profile updated in local state.');
    }
  };

  // Upload complete handler
  const handleUploadSuccess = async (parsedData: Partial<UserProfile>) => {
    const targetUserId = authUser?.id || profile.id;
    if (targetUserId) {
      localStorage.setItem(`jobscout_has_onboarded_${targetUserId}`, 'true');
    }
    const updatedProfile: UserProfile = {
      ...profile,
      ...parsedData,
      id: targetUserId,
      skills: (parsedData.skills && parsedData.skills.length > 0) ? parsedData.skills : profile.skills,
    };
    setProfile(updatedProfile);

    // Refresh jobs from vector match engine
    try {
      const matchResult = await matchJobsForCandidate({
        userId: targetUserId,
        overrideProfile: {
          title: updatedProfile.targetJobTitle || updatedProfile.currentTitle,
          skills: updatedProfile.skills,
          rawText: updatedProfile.resumeText,
        },
      });
      setJobs(matchResult.jobs);
    } catch (err) {
      console.warn('[Match refresh error]:', err);
    }
  };

  // Run Quick Matcher action via Supabase / Vector Engine
  const handleRunQuickMatcher = async () => {
    setIsMatching(true);
    const targetUserId = authUser?.id || profile.id;
    try {
      const matchResult = await matchJobsForCandidate({
        userId: targetUserId,
        overrideProfile: {
          title: profile.targetJobTitle || profile.currentTitle,
          skills: profile.skills,
          rawText: profile.resumeText,
        },
      });

      setJobs(matchResult.jobs);
      setHasRunMatcher(true);
      const topScore = matchResult.jobs.length > 0 ? Math.max(...matchResult.jobs.map(j => j.similarity)) : 0;
      showToast('AI Vector Match Complete', `Calculated compatibility across ${matchResult.jobs.length} jobs (Top Match: ${topScore}%).`);
    } catch (err) {
      console.warn('[Quick matcher note]:', err);
    } finally {
      setIsMatching(false);
    }
  };

  // Filter and Sort Jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchCompany = job.company.toLowerCase().includes(q);
          const matchSkill = job.required_skills.some((s) => s.toLowerCase().includes(q));
          const matchCategory = job.category.toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchSkill && !matchCategory) {
            return false;
          }
        }

        // Category
        if (filters.category !== 'All Categories' && job.category !== filters.category) {
          return false;
        }

        // Remote only
        if (filters.remoteOnly && !job.is_remote) {
          return false;
        }

        // Min Similarity threshold
        if (job.similarity < filters.minSimilarity) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'similarity') {
          if (hasRunMatcher) {
            return b.similarity - a.similarity;
          }
          // If matcher hasn't been run yet, sort by most recent
          const dateA = a.posted_at ? new Date(a.posted_at).getTime() : 0;
          const dateB = b.posted_at ? new Date(b.posted_at).getTime() : 0;
          return dateB - dateA;
        }
        if (filters.sortBy === 'recent') {
          const dateA = a.posted_at ? new Date(a.posted_at).getTime() : 0;
          const dateB = b.posted_at ? new Date(b.posted_at).getTime() : 0;
          return dateB - dateA;
        }
        if (filters.sortBy === 'salary') {
          const salaryNumA = a.salary_max || a.salary_min || (parseInt(a.salary.replace(/[^0-9]/g, '')) || 0);
          const salaryNumB = b.salary_max || b.salary_min || (parseInt(b.salary.replace(/[^0-9]/g, '')) || 0);
          return salaryNumB - salaryNumA;
        }
        return 0;
      });
  }, [jobs, filters, hasRunMatcher]);

  // Apply Handler
  const handleApply = (job: Job, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerConfetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#10b981', '#ffffff']
    });
    showToast('Application Queued', `Prepared tailored resume packet for ${job.title} at ${job.company}.`);
  };

  const showToast = (title: string, desc: string) => {
    setToastMessage({ title, desc });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'All Categories',
      remoteOnly: false,
      minSimilarity: 0,
      sortBy: 'similarity'
    });
  };

  // 1. If authView is 'landing', show clean Landing Page
  if (authView === 'landing') {
    return (
      <LandingPage
        onGoToSignIn={() => setAuthView('signin')}
        onExploreDemo={() => {
          setAuthView('dashboard');
          if (jobs.length === 0) {
            loadGuestJobs();
          }
        }}
        totalJobsCount={jobs.length || 28}
      />
    );
  }

  // 2. If authView is 'signin', show Google-Only Sign-In Page
  if (authView === 'signin') {
    return (
      <SignInPage
        onBackToHome={() => setAuthView('landing')}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  // 3. Multi-User Authenticated Dashboard View
  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans flex antialiased selection:bg-[#c8c2ac] selection:text-black">
      {/* Global Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        totalJobs={jobs.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenSettings={() => setSettingsOpen(true)}
        onSignOut={handleSignOut}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Canvas */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out bg-[#000000] ${
          sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-64'
        }`}
      >
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          onOpenCommand={() => setCommandPaletteOpen(true)}
          onNavigate={setCurrentTab}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Page Views Container */}
        <main key={currentTab} className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          {currentTab === 'jobs' && (
            <JobExplorerDashboard
              jobs={jobs}
              filteredJobs={filteredJobs}
              profile={profile}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onSelectJob={setSelectedJob}
              onApply={handleApply}
              onRunMatcher={handleRunQuickMatcher}
              isMatching={isMatching}
              onUploadClick={() => setCurrentTab('upload')}
              hasRunMatcher={hasRunMatcher}
              isLoading={isLoading || isFetchingJobs}
              onFetchJobs={handleDeveloperFetchJobs}
            />
          )}

          {currentTab === 'overview' && (
            <AnalyticsOverview
              profile={profile}
              jobs={jobs}
              onSelectJob={setSelectedJob}
              onNavigate={setCurrentTab}
              onRunMatcher={handleRunQuickMatcher}
            />
          )}

          {currentTab === 'upload' && (
            <OnboardingUpload
              onUploadSuccess={handleUploadSuccess}
              onNavigate={setCurrentTab}
              currentProfile={profile}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileManagement
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onNavigate={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          profile={profile}
          onClose={() => setSelectedJob(null)}
          onApply={(job) => handleApply(job)}
          hasRunMatcher={hasRunMatcher}
          onRunMatcher={handleRunQuickMatcher}
        />
      )}

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        jobs={jobs}
        onSelectJob={setSelectedJob}
        onNavigate={setCurrentTab}
        onRunMatcher={handleRunQuickMatcher}
        hasRunMatcher={hasRunMatcher}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        minSimilarity={filters.minSimilarity}
        onAccuracyChange={(val) => handleFilterChange({ minSimilarity: val })}
        onSaveToast={showToast}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] shadow-2xl text-white animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-[#c8c2ac]/20 text-[#c8c2ac] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#c8c2ac]" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toastMessage.title}</p>
            <p className="text-[11px] text-slate-400">{toastMessage.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

