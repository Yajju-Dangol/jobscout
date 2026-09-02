export type JobCategory = 'Frontend' | 'Backend' | 'Full-Stack' | 'AI / ML' | 'DevOps' | 'Mobile' | 'Product' | 'Engineering' | 'Data & Analytics' | 'Design / Product';

export const CATEGORIES = [
  'All Categories',
  'AI / ML',
  'Full-Stack',
  'Frontend',
  'Backend',
  'DevOps',
  'Mobile',
  'Product',
  'Engineering',
  'Data & Analytics'
];

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  is_remote: boolean;
  category: string;
  required_skills: string[];
  apply_url: string;
  similarity: number; // 0 to 100
  salary: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_is_predicted?: string | null;
  contract_time?: string | null;
  contract_type?: string | null;
  posted_at: string;
  experience_level: 'Entry' | 'Mid' | 'Senior' | 'Staff' | 'Lead';
  description: string;
  highlights: string[];
  vector_score: number;
  keyword_score: number;
  match_reasons: string[];
  missing_skills: string[];
}

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  currentTitle?: string;
  email?: string;
  avatarUrl?: string;
  targetJobTitle: string;
  workStyle?: 'Remote' | 'Hybrid' | 'On-site' | 'Any' | '' | string;
  location: string;
  minSalary: string;
  skills: string[];
  resumeText: string;
  lastUploadedFileName?: string;
  uploadDate?: string;
  resumeSummary?: string;
  vectorDimensions?: number;
  lastMatchedAt?: string;
}

export type ViewTab = 'jobs' | 'overview' | 'upload' | 'profile';

export interface FilterState {
  searchQuery: string;
  category: string;
  remoteOnly: boolean;
  minSimilarity: number;
  sortBy: 'similarity' | 'recent' | 'salary';
}

export interface ActivitySlot {
  day: string;
  hour: string;
  intensity: 0 | 1 | 2 | 3 | 4; // 0=none, 4=highest
  scrapedCount: number;
}
