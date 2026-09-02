import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Save, 
  UploadCloud, 
  Eye, 
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, ViewTab } from '../types';

interface ProfileManagementProps {
  profile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onNavigate: (tab: ViewTab) => void;
}

const ROLE_BASED_RECOMMENDATIONS: Record<string, string[]> = {
  'ai': ['PyTorch', 'Vector Embeddings', 'LangChain', 'FastAPI', 'Python', 'pgvector', 'RAG Pipelines'],
  'frontend': ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'WebSockets', 'Vitest'],
  'full-stack': ['TypeScript', 'Next.js', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis', 'GraphQL'],
  'backend': ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'FastAPI'],
  'devops': ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'GitHub Actions', 'Linux'],
  'mobile': ['React Native', 'Swift', 'Kotlin', 'Flutter', 'iOS', 'Android'],
  'product': ['UI/UX Design', 'Figma', 'User Research', 'Design Systems', 'Product Strategy']
};

export const ProfileManagement: React.FC<ProfileManagementProps> = ({
  profile,
  onSaveProfile,
  onNavigate
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const [newSkillInput, setNewSkillInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (skillToAdd?: string) => {
    const skill = (skillToAdd || newSkillInput).trim();
    if (!skill) return;

    const currentSkills = formData.skills || [];
    if (!currentSkills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill]
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  const suggestedSkills = useMemo(() => {
    const role = (formData.targetJobTitle || '').toLowerCase();
    let pool: string[] = [];

    if (role.includes('ai') || role.includes('ml')) {
      pool = [...ROLE_BASED_RECOMMENDATIONS.ai, ...ROLE_BASED_RECOMMENDATIONS['full-stack']];
    } else if (role.includes('front') || role.includes('ui')) {
      pool = [...ROLE_BASED_RECOMMENDATIONS.frontend, ...ROLE_BASED_RECOMMENDATIONS['full-stack']];
    } else if (role.includes('back') || role.includes('cloud')) {
      pool = [...ROLE_BASED_RECOMMENDATIONS.backend, ...ROLE_BASED_RECOMMENDATIONS.devops];
    } else {
      pool = [...ROLE_BASED_RECOMMENDATIONS['full-stack'], ...ROLE_BASED_RECOMMENDATIONS.ai];
    }

    const currentSkillsLower = (formData.skills || []).map((s) => s.toLowerCase());
    return pool.filter((s) => !currentSkillsLower.includes(s.toLowerCase())).slice(0, 6);
  }, [formData.targetJobTitle, formData.skills]);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-24">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Sticky Top Header with Save Profile button */}
        <div className="sticky top-16 z-20 bg-[#000000]/95 backdrop-blur-md -mt-2 pt-3 pb-4 border-b border-[#1c1c1c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Profile
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your personal background, role preferences, and verified competencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-[#c8c2ac] text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile saved</span>
              </span>
            )}

            <button
              type="submit"
              id="profile-save-btn"
              className="px-5 py-2.5 bg-white text-black hover:bg-slate-200 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </div>

        {/* Dashboard Side-by-Side Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Identity & Target Career Preferences */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white">Personal Information</h2>
                <p className="text-xs text-slate-400">Basic details connected to your account</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Full Name</label>
                  <input
                    type="text"
                    id="profile-fullname-input"
                    value={formData.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full bg-[#141414] border border-[#222222] focus:border-slate-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors"
                    placeholder="e.g. Alex Rivera"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Current Title / Seniority</label>
                  <input
                    type="text"
                    id="profile-currenttitle-input"
                    value={formData.currentTitle || ''}
                    onChange={(e) => handleInputChange('currentTitle', e.target.value)}
                    className="w-full bg-[#141414] border border-[#222222] focus:border-slate-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Target Preferences */}
            <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white">Target Career Preferences</h2>
                <p className="text-xs text-slate-400">Criteria used to determine job matching accuracy</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Target Role Title(s)</label>
                  <input
                    type="text"
                    id="profile-targetjobtitle-input"
                    value={formData.targetJobTitle || ''}
                    onChange={(e) => handleInputChange('targetJobTitle', e.target.value)}
                    className="w-full bg-[#141414] border border-[#222222] focus:border-slate-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors"
                    placeholder="e.g. Full-Stack & AI Systems Engineer"
                  />
                </div>

                {/* Work Style */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Preferred Work Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Remote', label: 'Remote' },
                      { id: 'Hybrid', label: 'Hybrid' },
                      { id: 'On-site', label: 'On-site' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => handleInputChange('workStyle', formData.workStyle === style.id ? '' : style.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                          formData.workStyle === style.id
                            ? 'bg-white text-black border-white font-semibold'
                            : 'bg-[#141414] border-[#222222] text-slate-400 hover:text-white hover:border-[#333333]'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Target Location</label>
                  <input
                    type="text"
                    id="profile-location-input"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full bg-[#141414] border border-[#222222] focus:border-slate-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors"
                    placeholder="e.g. San Francisco, CA (or Remote)"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Minimum Compensation</label>
                  <input
                    type="text"
                    id="profile-minsalary-input"
                    value={formData.minSalary || ''}
                    onChange={(e) => handleInputChange('minSalary', e.target.value)}
                    className="w-full bg-[#141414] border border-[#222222] focus:border-slate-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors"
                    placeholder="e.g. $160,000 / yr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Skills Stack & Resume Document */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section 3: Verified Skills */}
            <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Skills & Tech Stack</h2>
                  <p className="text-xs text-slate-400">Core technologies for job matching</p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-[#141414] px-2 py-0.5 rounded-md border border-[#222222]">
                  {(formData.skills || []).length} active
                </span>
              </div>

              {/* Active Skills */}
              <div className="min-h-[40px]">
                {(formData.skills || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {(formData.skills || []).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-[#141414] border border-[#222222] hover:border-[#333333] text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No skills added yet.</p>
                )}
              </div>

              {/* Add Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add skill (e.g. TypeScript, React)..."
                  className="flex-1 bg-[#141414] border border-[#222222] focus:border-slate-400 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#2a2a2a] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Suggested Skills */}
              {suggestedSkills.length > 0 && (
                <div className="pt-2 border-t border-[#1a1a1a] space-y-1.5">
                  <span className="text-[11px] text-slate-400">Suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedSkills.map((rec) => (
                      <button
                        key={rec}
                        type="button"
                        onClick={() => handleAddSkill(rec)}
                        className="px-2.5 py-1 rounded-md bg-[#141414] border border-[#222222] hover:border-[#333333] text-slate-300 hover:text-white text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-slate-400" />
                        <span>{rec}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Resume Document */}
            <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white">Active Resume</h2>
                <p className="text-xs text-slate-400">Ingested background backing your profile</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222] space-y-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-black border border-[#2a2a2a] flex items-center justify-center text-slate-300 shrink-0">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">
                      {formData.lastUploadedFileName || 'No resume uploaded'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formData.uploadDate ? `Uploaded ${formData.uploadDate}` : 'Upload a resume to auto-sync skills'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {formData.resumeSummary && (
                    <button
                      type="button"
                      onClick={() => setShowSummaryModal(true)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#252525] border border-[#2a2a2a] text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Summary</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate('upload')}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{formData.lastUploadedFileName ? 'Replace' : 'Upload'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowSummaryModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-6 shadow-2xl z-10 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
              <h3 className="text-sm font-bold text-white">Extracted Resume Summary</h3>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#141414] p-4 rounded-xl border border-[#222222]">
              {formData.resumeSummary || 'No resume summary generated yet.'}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
