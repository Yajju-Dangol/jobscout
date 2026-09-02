import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Layers, 
  FileCheck, 
  RefreshCw,
  AlertCircle,
  Zap,
  KeyRound
} from 'lucide-react';
import { triggerConfetti } from '../lib/confetti';
import { UserProfile, ViewTab } from '../types';
import { processDocumentFile, ProcessedDocument } from '../lib/pdfReader';
import { parseResumeWithAI, generateCandidateQueryEmbedding } from '../lib/ai';
import { saveProfileToSupabase } from '../lib/supabase';

interface OnboardingUploadProps {
  onUploadSuccess: (parsedProfile: Partial<UserProfile>) => void;
  onNavigate: (tab: ViewTab) => void;
  currentProfile: UserProfile;
}

type StepKey = 'idle' | 'reading' | 'extracting' | 'vectorizing' | 'complete' | 'error';

export const OnboardingUpload: React.FC<OnboardingUploadProps> = ({
  onUploadSuccess,
  onNavigate,
  currentProfile
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepKey>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    skillsCount: number;
    title: string;
    experience: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { key: 'reading', label: 'Extracting Text & Rendering PDF Pages (PDF.js)...', icon: FileText },
    { key: 'extracting', label: 'Analyzing Multimodal Resume via Gemini 3.5 Flash...', icon: Layers },
    { key: 'vectorizing', label: 'Generating 768-Dim Vector via Gemini Embedding 2...', icon: Cpu },
    { key: 'complete', label: 'Candidate Vectorized & Profile Synced!', icon: CheckCircle2 }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const [uploadMode, setUploadMode] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');

  const processFile = async (file: File) => {
    setFileName(file.name);
    setErrorMessage(null);
    setCurrentStep('reading');
    setProgressPercent(20);

    try {
      const processedDoc = await processDocumentFile(file);
      await executeServerlessParsing(file.name, processedDoc);
    } catch (err: any) {
      console.error('[Document processing error]:', err);
      setCurrentStep('error');
      setErrorMessage(err.message || 'Failed to read document file.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    setFileName('Pasted_Resume.txt');
    setErrorMessage(null);
    executeServerlessParsing('Pasted_Resume.txt', pastedText.trim());
  };

  const handleSampleResume = () => {
    const sampleResume = `Alex Morgan
Senior Full-Stack & AI Systems Engineer
Email: alex.morgan@example.com | San Francisco, CA (Remote)

Professional Summary:
Full-stack and AI systems engineer with 6+ years of experience designing scalable distributed web applications, REST/GraphQL APIs, and semantic AI search integrations using TypeScript, React, Next.js, Node.js, Python, PostgreSQL, and pgvector.

Core Technical Skills:
- Frontend: React, Next.js, TypeScript, Tailwind CSS, State Management, Responsive Design
- Backend & Cloud: Node.js, Python, FastAPI, PostgreSQL, Supabase, Redis, Docker, AWS
- AI & Data: Vector Embeddings, Semantic Search, pgvector, Gemini API, LangChain

Experience:
Senior Software Engineer | HighScale Technologies | 2022 - Present
- Built semantic vector search engine reducing candidate match latency by 40%.
- Architected Next.js App Router frontends with modern Tailwind styling and real-time WebSocket sync.
- Designed resilient PostgreSQL schemas and database RPC functions for pgvector similarity.`;

    setFileName('Sample_Engineer_Resume.pdf');
    setErrorMessage(null);
    executeServerlessParsing('Sample_Engineer_Resume.pdf', sampleResume);
  };

  const executeServerlessParsing = async (
    uploadedName: string,
    docOrText: ProcessedDocument | string
  ) => {
    setErrorMessage(null);
    setCurrentStep('reading');
    setProgressPercent(30);

    try {
      // 1. Parse resume structure & skills with Gemini 3.5 Flash using multimodal inputs (images / direct PDF / text)
      setCurrentStep('extracting');
      setProgressPercent(60);
      const parsed = await parseResumeWithAI(docOrText);

      // 2. Prepare clean textual representation (never raw unparsed binary PDF bytecode)
      const rawExtractedText = typeof docOrText === 'string' ? docOrText : (docOrText.text || '');
      const cleanCandidateText = [
        `${parsed.fullName} - ${parsed.title}`,
        `Location: ${parsed.location} | Preference: ${parsed.workStyle}`,
        `Summary: ${parsed.summary}`,
        `Skills: ${parsed.skills.join(', ')}`,
        parsed.keyAchievements && parsed.keyAchievements.length > 0
          ? `Key Achievements:\n${parsed.keyAchievements.map((a) => `- ${a}`).join('\n')}`
          : '',
        rawExtractedText ? `\nExtracted Content:\n${rawExtractedText.slice(0, 4000)}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      // 3. Generate 768-dim query embedding using Gemini Embedding 2
      setCurrentStep('vectorizing');
      setProgressPercent(85);
      const embedding = await generateCandidateQueryEmbedding({
        title: parsed.title,
        skills: parsed.skills,
        rawText: cleanCandidateText,
        summary: parsed.summary,
      });

      // 4. Save directly to Supabase profiles table with candidate's user ID, clean text and vector embedding
      await saveProfileToSupabase({
        id: currentProfile.id,
        fullName: parsed.fullName,
        title: parsed.title,
        skills: parsed.skills,
        rawText: cleanCandidateText,
        embedding,
      });

      const updatedProfile: Partial<UserProfile> = {
        id: currentProfile.id,
        fullName: parsed.fullName,
        currentTitle: parsed.title,
        targetJobTitle: parsed.title,
        skills: parsed.skills,
        workStyle: (['Remote', 'Hybrid', 'On-site', 'Any'].includes(parsed.workStyle) ? parsed.workStyle : 'Remote') as 'Remote' | 'Hybrid' | 'On-site' | 'Any',
        location: parsed.location,
        minSalary: parsed.minSalary,
        lastUploadedFileName: uploadedName,
        uploadDate: new Date().toLocaleDateString(),
        resumeSummary: parsed.summary,
        resumeText: cleanCandidateText,
        vectorDimensions: 768,
      };

      setCurrentStep('complete');
      setProgressPercent(100);

      setExtractedData({
        skillsCount: parsed.skills.length,
        title: parsed.title,
        experience: 'Verified',
      });

      onUploadSuccess(updatedProfile);

      triggerConfetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#c8c2ac', '#ffffff', '#71717a'],
      });
    } catch (err: any) {
      console.error('[Gemini Parsing/Embedding Error]:', err);
      setCurrentStep('error');
      setErrorMessage(err.message || 'Gemini API failed to parse resume or generate embedding.');
    }
  };

  const handleReset = () => {
    setCurrentStep('idle');
    setProgressPercent(0);
    setErrorMessage(null);
    setFileName('');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto py-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#c8c2ac] text-xs font-semibold">
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Resume Ingestion (Gemini 3.5 Flash & Gemini Embedding 2)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Upload Your Resume
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Our AI parser extracts your core tech stack, seniority, and project history to calculate instant vector match scores.
        </p>
      </div>

      {/* Main Drag & Drop Zone or Text Paste */}
      {currentStep === 'idle' && (
        <div className="space-y-4">
          {/* Mode Switcher */}
          <div className="flex items-center justify-center gap-2 p-1 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl w-fit mx-auto">
            <button
              onClick={() => setUploadMode('file')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                uploadMode === 'file'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload PDF / File
            </button>
            <button
              onClick={() => setUploadMode('paste')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                uploadMode === 'paste'
                  ? 'bg-white text-black shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paste Resume Text
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer relative group ${
                dragActive
                  ? 'border-white bg-[#141414] scale-[1.01]'
                  : 'border-[#1f1f1f] bg-[#0f0f0f] hover:border-[#333333] hover:bg-[#141414]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleManualUpload}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-[#000000] border border-[#1f1f1f] flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                Drag and drop your resume file here
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Supported formats: PDF, DOCX, TXT (Direct client extraction)
              </p>

              <button
                type="button"
                className="px-5 py-2 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Browse Files
              </button>
            </div>
          ) : (
            <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl p-6 space-y-4">
              <label className="block text-xs font-bold text-white">
                Paste Resume Text or Markdown
              </label>
              <textarea
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your full resume summary, employment history, and technical skills here..."
                className="w-full bg-[#000000] border border-[#1f1f1f] focus:border-white rounded-xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  disabled={!pastedText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer shadow-lg"
                >
                  Parse & Vectorize Text
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Pre-fill */}
          <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Try sample engineer template</span>
                <span className="text-[10px] text-slate-400">Pre-formats full-stack & AI competencies</span>
              </div>
            </div>

            <button
              onClick={handleSampleResume}
              className="px-3.5 py-1.5 rounded-lg bg-[#000000] hover:bg-[#1a1a1a] text-slate-300 hover:text-white border border-[#1f1f1f] text-xs font-bold transition-colors cursor-pointer"
            >
              Load Sample
            </button>
          </div>
        </div>
      )}

      {/* Error Card */}
      {currentStep === 'error' && (
        <div className="bg-[#0f0f0f] border border-red-500/30 rounded-2xl p-8 space-y-6 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 text-red-400">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Processing Error</h3>
              <p className="text-xs text-red-400 font-mono">Gemini parsing or embedding failed</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-red-500/20 font-mono text-xs text-red-300 break-words leading-relaxed">
            {errorMessage || 'Unknown error occurred while calling the Gemini API.'}
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <KeyRound className="w-4 h-4 text-[#c8c2ac]" />
              <span>Troubleshooting Tips:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Ensure your <code className="text-[#c8c2ac] bg-black px-1.5 py-0.5 rounded font-mono">VITE_GEMINI_KEY</code> is correctly set and valid.</li>
              <li>Verify that your API key has access to <code className="text-slate-200">gemini-embedding-2</code> and <code className="text-slate-200">gemini-3.5-flash</code>.</li>
              <li>Check your internet connection and API quotas.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Processing Pipeline Animation */}
      {currentStep !== 'idle' && currentStep !== 'error' && (
        <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{fileName}</h4>
                <span className="text-[11px] text-slate-400 font-mono">Status: {currentStep}</span>
              </div>
            </div>

            <span className="text-sm font-mono font-bold text-[#c8c2ac]">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#000000] h-2 rounded-full overflow-hidden border border-[#1f1f1f]">
            <div
              className="h-full bg-[#c8c2ac] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step Timeline */}
          <div className="space-y-3 pt-2">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCurrent = currentStep === s.key;
              const isDone = progressPercent >= (idx + 1) * 25;

              return (
                <div
                  key={s.key}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-[#c8c2ac]/10 border border-[#c8c2ac]/30 text-white'
                      : isDone
                      ? 'bg-[#000000] border border-[#1f1f1f] text-slate-300'
                      : 'bg-transparent text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#c8c2ac] animate-pulse' : isDone ? 'text-[#c8c2ac]' : 'text-slate-600'}`} />
                    <span className="text-xs font-semibold">{s.label}</span>
                  </div>

                  {isDone && <CheckCircle2 className="w-4 h-4 text-[#c8c2ac]" />}
                </div>
              );
            })}
          </div>

          {/* Complete Extracted Summary Box */}
          {currentStep === 'complete' && extractedData && (
            <div className="p-4 rounded-xl bg-[#000000] border border-[#c8c2ac]/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#c8c2ac] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Successfully Parsed & Vectorized!
                </span>
                <span className="text-xs font-mono text-slate-400">Ready to Match</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f]">
                  <span className="text-[10px] text-slate-400 block">Skills Extracted</span>
                  <span className="text-sm font-bold text-white font-mono">{extractedData.skillsCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f]">
                  <span className="text-[10px] text-slate-400 block">Experience</span>
                  <span className="text-sm font-bold text-white font-mono">{extractedData.experience}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f]">
                  <span className="text-[10px] text-slate-400 block">Cosine Pipeline</span>
                  <span className="text-sm font-bold text-[#c8c2ac] font-mono">100% Synced</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => onNavigate('overview')}
                  className="px-4 py-2 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  View Analytics
                </button>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="px-5 py-2 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                >
                  <span>Explore Matched Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
