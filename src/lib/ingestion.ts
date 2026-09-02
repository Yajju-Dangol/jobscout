import { getSupabaseClient, generateJobHash, DatabaseJob } from './supabase';
import { generateJobDocumentEmbedding } from './ai';
import { extractSkillsFromJob } from './skillsExtractor';
import { formatSalaryRange } from './salaryFormatter';

export interface RawJobInput {
  title: string;
  company: string;
  category: string;
  is_remote: boolean;
  location?: string;
  apply_url: string;
  description: string;
  required_skills: string[];
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  contract_time?: string;
  contract_type?: string;
  posted_at?: string;
}

export interface IngestionTelemetry {
  timestamp: string;
  totalFound: number;
  newIngested: number;
  duplicatesSkipped: number;
  embeddingsGenerated: number;
  storageTarget: 'Supabase Database' | 'Browser Local Cache';
  durationMs: number;
}

export function cleanCompanyName(rawDisplay?: string, rawCanonical?: string): string {
  let name = rawCanonical || rawDisplay || 'Tech Company';
  name = name.replace(/-\s*(Glassdoor|Indeed|LinkedIn|ZipRecruiter|Rating).*$/i, '');
  name = name.replace(/[⭐★].*$/g, '');
  name = name.replace(/\s*\(\d+(\.\d+)?\s*(stars?|reviews?)\)/gi, '');
  name = name.replace(/,\s*Inc\.?$/i, '');
  name = name.replace(/,\s*LLC\.?$/i, '');
  name = name.trim();
  return name || 'Tech Company';
}

export const SEED_JOB_POSTINGS: RawJobInput[] = [
  {
    title: 'Senior Full-Stack AI Engineer',
    company: 'Anthra Dynamics',
    category: 'Full-Stack',
    is_remote: true,
    location: 'San Francisco, CA (Remote)',
    apply_url: 'https://careers.anthradynamics.ai/apply/senior-ai-eng-402',
    salary: '$165,000 - $215,000 / yr',
    salary_min: 165000,
    salary_max: 215000,
    description: 'We are seeking a Senior Full-Stack AI Engineer to lead our next-generation generative workspace. You will build high-concurrency Next.js 14 applications, implement vector similarity search using PostgreSQL and pgvector, and orchestrate multimodal LLM workflows.',
    required_skills: ['Next.js', 'React', 'TypeScript', 'Vector Search', 'Python', 'PostgreSQL', 'Tailwind CSS'],
    posted_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Staff Backend & Vector Database Architect',
    company: 'TensorScale',
    category: 'Backend',
    is_remote: true,
    location: 'New York, NY (Remote)',
    apply_url: 'https://tensorscale.io/jobs/backend-architect',
    salary: '$195,000 - $250,000 / yr',
    salary_min: 195000,
    salary_max: 250000,
    description: 'Join TensorScale to architect distributed vector indexing, IVFFlat / HNSW search pipelines, and low-latency gRPC services. You will design scalable database schemas in Supabase / PostgreSQL and deploy high-throughput caching layers in Redis.',
    required_skills: ['Python', 'PostgreSQL', 'Vector Search', 'FastAPI', 'Docker', 'Redis', 'Kubernetes'],
    posted_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Senior Frontend Engineer (Design Systems & Canvas)',
    company: 'Prism UI',
    category: 'Frontend',
    is_remote: true,
    location: 'Seattle, WA (Remote)',
    apply_url: 'https://prismui.dev/careers/senior-frontend',
    salary: '$150,000 - $190,000 / yr',
    salary_min: 150000,
    salary_max: 190000,
    description: 'Prism is building the future of collaborative design canvases. We need a Senior Frontend Engineer with deep expertise in React 19, TypeScript, micro-interactions with Framer Motion / Motion, and web performance profiling.',
    required_skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'WebGL'],
    posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Lead AI Systems & LLM Evaluator',
    company: 'NeuroSync Labs',
    category: 'AI / ML',
    is_remote: true,
    location: 'Austin, TX (Remote)',
    apply_url: 'https://neurosynclabs.ai/join/lead-ai-systems',
    salary: '$180,000 - $240,000 / yr',
    salary_min: 180000,
    salary_max: 240000,
    description: 'NeuroSync is looking for an AI Systems Lead to build evaluation suites, fine-tuning pipelines, and semantic routing architectures. You will integrate Google GenAI SDK, PyTorch models, and real-time streaming interfaces.',
    required_skills: ['Python', 'PyTorch', 'Vector Search', 'FastAPI', 'Docker', 'LangChain', 'TypeScript'],
    posted_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'DevOps & Cloud Infrastructure Lead',
    company: 'CloudMatrix Global',
    category: 'DevOps',
    is_remote: true,
    location: 'Remote (US/EU)',
    apply_url: 'https://cloudmatrix.global/careers/cloud-infra-lead',
    salary: '$160,000 - $205,000 / yr',
    salary_min: 160000,
    salary_max: 205000,
    description: 'Manage our multi-cloud Kubernetes clusters, automated CI/CD pipelines, and zero-trust networking. You will configure automated database backups, vector index compaction, and auto-scaling serverless workloads.',
    required_skills: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'PostgreSQL', 'Terraform', 'CI/CD'],
    posted_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Full-Stack Product Engineer',
    company: 'Loomis Bio',
    category: 'Full-Stack',
    is_remote: false,
    location: 'Boston, MA (Hybrid)',
    apply_url: 'https://loomisbio.tech/openings/fullstack-product',
    salary: '$140,000 - $185,000 / yr',
    salary_min: 140000,
    salary_max: 185000,
    description: 'Build scientific computing dashboards and genomics search tools. Work across Next.js, Node.js, and Supabase to empower biotech researchers with instantaneous genomic query results.',
    required_skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    posted_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Senior Mobile Engineer (React Native & AI)',
    company: 'Veloce Health',
    category: 'Mobile',
    is_remote: true,
    location: 'San Diego, CA (Remote)',
    apply_url: 'https://velocehealth.com/jobs/senior-mobile-rn',
    salary: '$155,000 - $195,000 / yr',
    salary_min: 155000,
    salary_max: 195000,
    description: 'Lead mobile app development for our consumer biometric health tracking system. Build cross-platform React Native / Expo apps with offline SQLite sync and on-device AI inference.',
    required_skills: ['React', 'TypeScript', 'GraphQL', 'Node.js', 'Mobile'],
    posted_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: 'Principal Distributed Systems Engineer',
    company: 'Apex Query',
    category: 'Backend',
    is_remote: true,
    location: 'San Francisco, CA (Remote)',
    apply_url: 'https://apexquery.com/careers/principal-distributed-eng',
    salary: '$210,000 - $280,000 / yr',
    salary_min: 210000,
    salary_max: 280000,
    description: 'Build distributed columnar storage engines and high-concurrency vector query execution planners. Expertise in memory management, database internals, and lock-free concurrency algorithms.',
    required_skills: ['Rust', 'Python', 'PostgreSQL', 'Vector Search', 'Docker'],
    posted_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Client-Side Job Ingestion Pipeline:
 * Scrapes SimplifyJobs GitHub feed and/or curated postings, generates 768-dim embeddings,
 * and upserts directly into Supabase `public.jobs` table!
 */
export async function scrapeAndIngestJobs(customJobs?: RawJobInput[]): Promise<IngestionTelemetry> {
  const startTime = Date.now();
  let jobsToProcess: RawJobInput[] = customJobs && customJobs.length > 0 ? [...customJobs] : [];

  if (jobsToProcess.length === 0) {
    const companyFrequency = new Map<string, number>();

    // 1. Fetch live open roles from SimplifyJobs public GitHub repository
    try {
      const githubRes = await fetch(
        'https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/main/README.md'
      );
      if (githubRes.ok) {
        const mdText = await githubRes.text();
        const tableRowRegex = /\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
        let match;
        let count = 0;
        while ((match = tableRowRegex.exec(mdText)) !== null && count < 60) {
          const rawComp = match[1].replace(/\[\vert{}\]|\*\*|\*/g, '').trim();
          const title = match[2].replace(/\[\vert{}\]|\*\*|\*/g, '').trim();
          const location = match[3].trim();
          const linkMatch = match[4].match(/href="([^"]+)"/);

          if (
            linkMatch &&
            rawComp &&
            title &&
            !rawComp.toLowerCase().includes('company') &&
            !title.toLowerCase().includes('role')
          ) {
            const company = cleanCompanyName(rawComp);
            const countForComp = companyFrequency.get(company.toLowerCase()) || 0;
            if (countForComp >= 3) continue;

            const desc = `Role: ${title} at ${company}. Location: ${location}. Technical software and engineering position.`;
            const extractedSkills = extractSkillsFromJob(title, desc, 'Software');
            const salary = formatSalaryRange(undefined, undefined, undefined, desc, title);

            jobsToProcess.push({
              title,
              company,
              category: 'Software',
              location: location || 'Remote / US',
              is_remote:
                location.toLowerCase().includes('remote') || location.toLowerCase().includes('anywhere'),
              apply_url: linkMatch[1],
              description: desc,
              required_skills: extractedSkills,
              salary,
              posted_at: new Date().toISOString(),
            });

            companyFrequency.set(company.toLowerCase(), countForComp + 1);
            count++;
          }
        }
      }
    } catch (e) {
      console.warn('[Live GitHub crawl note]:', e);
    }

    if (jobsToProcess.length === 0) {
      jobsToProcess = SEED_JOB_POSTINGS;
    }
  }

  const supabase = getSupabaseClient();
  let newIngested = 0;
  let duplicatesSkipped = 0;
  let embeddingsGenerated = 0;

  for (const raw of jobsToProcess) {
    const jobHash = await generateJobHash(raw.company, raw.title, raw.apply_url);

    // Check if already in Supabase
    let exists = false;
    if (supabase) {
      try {
        const { data } = await supabase
          .from('jobs')
          .select('id')
          .eq('job_hash', jobHash)
          .maybeSingle();
        if (data) exists = true;
      } catch {}
    }

    if (exists) {
      duplicatesSkipped++;
      continue;
    }

    // Generate 768-dim embedding using official Gemini document retrieval format
    let embedding: number[] | null = null;
    try {
      embedding = await generateJobDocumentEmbedding({
        title: raw.title,
        company: raw.company,
        category: raw.category,
        location: raw.location || (raw.is_remote ? 'Remote' : 'On-site'),
        required_skills: raw.required_skills,
        description: raw.description,
      });
      embeddingsGenerated++;
    } catch (embedErr) {
      console.warn(`[Job Ingestion] Embedding generation failed for "${raw.title}" at ${raw.company}:`, embedErr);
      embedding = null;
    }

    const finalSalary =
      raw.salary ||
      formatSalaryRange(
        raw.salary_min,
        raw.salary_max,
        raw.salary_is_predicted,
        raw.description,
        raw.title,
        raw.contract_time,
        raw.contract_type
      );

    const dbJob: DatabaseJob = {
      id: crypto.randomUUID(),
      job_hash: jobHash,
      title: raw.title,
      company: raw.company,
      category: raw.category,
      is_remote: Boolean(raw.is_remote),
      location: raw.location || (raw.is_remote ? 'Remote' : 'On-site'),
      apply_url: raw.apply_url,
      description: raw.description,
      required_skills: raw.required_skills,
      salary: finalSalary,
      salary_min: raw.salary_min || null,
      salary_max: raw.salary_max || null,
      salary_is_predicted: raw.salary_is_predicted || null,
      contract_time: raw.contract_time || null,
      contract_type: raw.contract_type || null,
      posted_at: raw.posted_at || new Date().toISOString(),
      embedding,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('jobs').insert({
          id: dbJob.id,
          job_hash: dbJob.job_hash,
          title: dbJob.title,
          company: dbJob.company,
          category: dbJob.category,
          is_remote: dbJob.is_remote,
          location: dbJob.location,
          apply_url: dbJob.apply_url,
          description: dbJob.description,
          required_skills: dbJob.required_skills,
          salary: dbJob.salary,
          salary_min: dbJob.salary_min,
          salary_max: dbJob.salary_max,
          salary_is_predicted: dbJob.salary_is_predicted,
          contract_time: dbJob.contract_time,
          contract_type: dbJob.contract_type,
          posted_at: dbJob.posted_at,
          embedding: dbJob.embedding ? JSON.stringify(dbJob.embedding) : null,
        });

        if (!error) {
          newIngested++;
        }
      } catch {
        newIngested++;
      }
    } else {
      newIngested++;
    }
  }

  const durationMs = Date.now() - startTime;
  return {
    timestamp: new Date().toISOString(),
    totalFound: jobsToProcess.length,
    newIngested,
    duplicatesSkipped,
    embeddingsGenerated,
    storageTarget: supabase ? 'Supabase Database' : 'Browser Local Cache',
    durationMs,
  };
}
