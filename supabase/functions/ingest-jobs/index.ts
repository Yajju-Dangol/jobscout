import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenAI } from "npm:@google/genai";

interface RawJobInput {
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

function formatSalary(min?: number, max?: number, isPredicted?: string, desc?: string, title?: string, contractTime?: string, contractType?: string): string {
  if (min && max && min > 0 && max > 0) {
    if (min === max) {
      const formatted = min >= 1000 ? `$${Math.round(min / 1000)}k` : `$${min}`;
      const suffix = isPredicted === "1" ? " / yr (Est.)" : " / yr";
      return `${formatted}${suffix}`;
    }
    const minFormatted = min >= 1000 ? `$${Math.round(min / 1000)}k` : `$${min}`;
    const maxFormatted = max >= 1000 ? `$${Math.round(max / 1000)}k` : `$${max}`;
    const suffix = isPredicted === "1" ? " / yr (Est.)" : " / yr";
    return `${minFormatted} - ${maxFormatted}${suffix}`;
  }
  if (min && min > 0) {
    const minFormatted = min >= 1000 ? `$${Math.round(min / 1000)}k` : `$${min}`;
    const suffix = isPredicted === "1" ? " / yr (Est.)" : " / yr";
    return `From ${minFormatted}${suffix}`;
  }
  if (max && max > 0) {
    const maxFormatted = max >= 1000 ? `$${Math.round(max / 1000)}k` : `$${max}`;
    const suffix = isPredicted === "1" ? " / yr (Est.)" : " / yr";
    return `Up to ${maxFormatted}${suffix}`;
  }
  if (desc) {
    const match = desc.match(/\$(\d{2,3}(?:,\d{3})*|\d{2,3}k)\s*(?:-|to)\s*\$?(\d{2,3}(?:,\d{3})*|\d{2,3}k)/i);
    if (match) return `${match[0]} / yr`;
  }
  if (contractType === "contract" || contractTime === "part_time") {
    return "$65 - $115 / hr (Est.)";
  }
  const tLower = (title || "").toLowerCase();
  if (tLower.includes("staff") || tLower.includes("principal") || tLower.includes("director") || tLower.includes("lead")) {
    return "$190k - $250k / yr (Est.)";
  }
  if (tLower.includes("senior") || tLower.includes("sr.")) {
    return "$155k - $210k / yr (Est.)";
  }
  return "$135k - $185k / yr (Est.)";
}

const TECH_SKILL_PATTERNS: { name: string; regex: RegExp }[] = [
  // Programming Languages
  { name: 'TypeScript', regex: /\b(typescript|ts)\b/i },
  { name: 'JavaScript', regex: /\b(javascript|js|es6)\b/i },
  { name: 'Python', regex: /\b(python|python3|py)\b/i },
  { name: 'Rust', regex: /\b(rust|rust-lang|cargo)\b/i },
  { name: 'Go', regex: /\b(golang|go\s+developer|go\s+backend|\bgo\b)\b/i },
  { name: 'Java', regex: /\b(java|jvm|spring\s*boot|spring)\b/i },
  { name: 'C++', regex: /\b(c\+\+|cpp)\b/i },
  { name: 'C#', regex: /\b(c#|csharp|\.net|dotnet|asp\.net)\b/i },
  { name: 'Ruby', regex: /\b(ruby|rails)\b/i },
  { name: 'PHP', regex: /\b(php|laravel)\b/i },
  { name: 'Swift', regex: /\b(swift|swiftui|ios)\b/i },
  { name: 'Kotlin', regex: /\b(kotlin|android)\b/i },
  { name: 'SQL', regex: /\b(sql|mysql|postgresql|postgres)\b/i },

  // Frontend & UI
  { name: 'React', regex: /\b(react|reactjs|react\.js)\b/i },
  { name: 'Next.js', regex: /\b(next\.?js|nextjs)\b/i },
  { name: 'Vue.js', regex: /\b(vue|vuejs|nuxt)\b/i },
  { name: 'Angular', regex: /\b(angular|angularjs)\b/i },
  { name: 'Tailwind CSS', regex: /\b(tailwind|tailwindcss)\b/i },
  { name: 'CSS / HTML', regex: /\b(css3?|html5?|sass|scss)\b/i },
  { name: 'GraphQL', regex: /\b(graphql|apollo)\b/i },

  // Backend & APIs
  { name: 'Node.js', regex: /\b(node|nodejs|node\.js)\b/i },
  { name: 'Express', regex: /\b(express|expressjs)\b/i },
  { name: 'FastAPI', regex: /\b(fastapi)\b/i },
  { name: 'Django', regex: /\b(django|drf)\b/i },
  { name: 'REST APIs', regex: /\b(rest|restful|rest\s+api|apis?)\b/i },
  { name: 'Microservices', regex: /\b(microservices?|distributed\s+systems)\b/i },

  // Databases & Vector Search
  { name: 'PostgreSQL', regex: /\b(postgresql|postgres|psql|pgvector)\b/i },
  { name: 'MongoDB', regex: /\b(mongodb|mongo)\b/i },
  { name: 'Redis', regex: /\b(redis|caching)\b/i },
  { name: 'Supabase', regex: /\b(supabase)\b/i },
  { name: 'Vector Search', regex: /\b(vector\s+(search|database|index|embedding)|pgvector|pinecone|qdrant)\b/i },
  { name: 'Kafka', regex: /\b(kafka|rabbitmq|event-driven)\b/i },

  // Cloud & DevOps
  { name: 'AWS', regex: /\b(aws|amazon\s+web\s+services|ec2|s3|lambda|ecs)\b/i },
  { name: 'GCP', regex: /\b(gcp|google\s+cloud|cloud\s+run)\b/i },
  { name: 'Docker', regex: /\b(docker|containers?)\b/i },
  { name: 'Kubernetes', regex: /\b(kubernetes|k8s)\b/i },
  { name: 'CI/CD', regex: /\b(ci\/cd|github\s+actions|jenkins)\b/i },
  { name: 'Terraform', regex: /\b(terraform|iac)\b/i },
  { name: 'Linux', regex: /\b(linux|unix|bash)\b/i },

  // AI / ML
  { name: 'PyTorch', regex: /\b(pytorch|torch)\b/i },
  { name: 'TensorFlow', regex: /\b(tensorflow|tf)\b/i },
  { name: 'LLMs & GenAI', regex: /\b(llms?|generative\s+ai|genai|gpt|gemini|rag|langchain)\b/i },
  { name: 'Machine Learning', regex: /\b(machine\s+learning|\bml\b|deep\s+learning)\b/i },
  { name: 'Data Pipelines', regex: /\b(etl|data\s+pipeline|spark|pyspark|pandas)\b/i },
  { name: 'React Native', regex: /\b(react\s+native|expo)\b/i },
];

function cleanCompanyName(rawDisplay?: string, rawCanonical?: string): string {
  let name = rawCanonical || rawDisplay || "Tech Company";
  name = name.replace(/-\s*(Glassdoor|Indeed|LinkedIn|ZipRecruiter|Rating).*$/i, "");
  name = name.replace(/[⭐★].*$/g, "");
  name = name.replace(/\s*\(\d+(\.\d+)?\s*(stars?|reviews?)\)/gi, "");
  name = name.replace(/,\s*Inc\.?$/i, "");
  name = name.replace(/,\s*LLC\.?$/i, "");
  name = name.trim();
  return name || "Tech Company";
}

function extractSkillsFromText(title: string, description: string, category?: string): string[] {
  const combined = `${title} ${description} ${category || ''}`.toLowerCase();
  const matchedSkills: string[] = [];

  for (const { name, regex } of TECH_SKILL_PATTERNS) {
    if (regex.test(combined) && !matchedSkills.includes(name)) {
      matchedSkills.push(name);
    }
  }

  if (matchedSkills.length < 3) {
    const tLower = title.toLowerCase();
    if (tLower.includes('frontend') || tLower.includes('ui') || tLower.includes('web')) {
      ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'CSS / HTML'].forEach(s => {
        if (!matchedSkills.includes(s)) matchedSkills.push(s);
      });
    } else if (tLower.includes('backend') || tLower.includes('api') || tLower.includes('server')) {
      ['Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Docker'].forEach(s => {
        if (!matchedSkills.includes(s)) matchedSkills.push(s);
      });
    } else if (tLower.includes('ai') || tLower.includes('ml') || tLower.includes('data')) {
      ['Python', 'PyTorch', 'LLMs & GenAI', 'Vector Search', 'Data Pipelines'].forEach(s => {
        if (!matchedSkills.includes(s)) matchedSkills.push(s);
      });
    } else if (tLower.includes('devops') || tLower.includes('cloud') || tLower.includes('infra')) {
      ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'].forEach(s => {
        if (!matchedSkills.includes(s)) matchedSkills.push(s);
      });
    } else {
      ['TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Docker'].forEach(s => {
        if (!matchedSkills.includes(s)) matchedSkills.push(s);
      });
    }
  }

  return matchedSkills.slice(0, 7);
}

// Generate unique 32-char SHA-256 hash
async function generateJobHash(company: string, title: string, applyUrl: string): Promise<string> {
  const norm = `${company.toLowerCase().trim()}_${title.toLowerCase().trim()}_${applyUrl.trim()}`;
  const msgUint8 = new TextEncoder().encode(norm);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

// Generate 768-dimensional AI semantic vector embedding with Gemini
async function generateEmbedding(text: string, geminiKey: string): Promise<number[]> {
  try {
    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: text,
      });

      if (response.embedding?.values && response.embedding.values.length > 0) {
        return response.embedding.values;
      }
    }
  } catch (err) {
    console.warn("[Gemini Edge Embedding Warning]:", err);
  }

  const vec = new Array(768).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < 768; i++) {
    vec[i] = Math.sin(hash + i * 0.31) * 0.05;
  }
  return vec;
}

// Main Edge Function Entrypoint
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const startTime = Date.now();
  console.log("[ingest-jobs] Edge function started at", new Date().toISOString());

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://fbcicalhwceufdyqcuyc.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
    const geminiKey = Deno.env.get("GEMINI_API_KEY") || "";
    const adzunaAppId = Deno.env.get("ADZUNA_APP_ID") || "";
    const adzunaAppKey = Deno.env.get("ADZUNA_APP_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const jobsToProcess: RawJobInput[] = [];
    const companyFrequency = new Map<string, number>();

    // 1. SimplifyJobs Live Tech Feed (Top Tech Companies & Startups)
    try {
      const githubRes = await fetch(
        "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/main/README.md"
      );
      if (githubRes.ok) {
        const mdText = await githubRes.text();
        const tableRowRegex = /\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
        let match;
        let count = 0;
        while ((match = tableRowRegex.exec(mdText)) !== null && count < 80) {
          const rawComp = match[1].replace(/\[\vert{}\]|\*\*|\*/g, "").trim();
          const title = match[2].replace(/\[\vert{}\]|\*\*|\*/g, "").trim();
          const location = match[3].trim();
          const linkMatch = match[4].match(/href="([^"]+)"/);

          if (linkMatch && rawComp && title && !rawComp.toLowerCase().includes("company") && !title.toLowerCase().includes("role")) {
            const company = cleanCompanyName(rawComp);
            const countForComp = companyFrequency.get(company.toLowerCase()) || 0;
            if (countForComp >= 3) continue;

            const desc = `Role: ${title} at ${company}. Location: ${location}. Technical software & engineering position.`;
            const skills = extractSkillsFromText(title, desc, 'Software');
            jobsToProcess.push({
              title,
              company,
              category: "Software",
              location: location || "Remote / US",
              is_remote: location.toLowerCase().includes("remote") || location.toLowerCase().includes("anywhere"),
              apply_url: linkMatch[1],
              description: desc,
              required_skills: skills,
              posted_at: new Date().toISOString(),
            });

            companyFrequency.set(company.toLowerCase(), countForComp + 1);
            count++;
          }
        }
      }
    } catch (err) {
      console.warn("[SimplifyJobs Error]:", err);
    }

    // 2. Adzuna API Multi-Query Diversity Search
    if (adzunaAppId && adzunaAppKey) {
      const queries = [
        "what=software%20engineer&category=it-jobs&sort_by=date&max_days_old=30&results_per_page=40",
        "what=full%20stack%20developer&category=it-jobs&sort_by=relevance&max_days_old=30&results_per_page=30",
        "what=frontend%20react%20typescript&category=it-jobs&sort_by=date&max_days_old=30&results_per_page=30",
        "what=python%20backend%20cloud&category=it-jobs&sort_by=date&max_days_old=30&results_per_page=30",
      ];

      for (const queryStr of queries) {
        try {
          const adzunaRes = await fetch(
            `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${adzunaAppId}&app_key=${adzunaAppKey}&${queryStr}`
          );
          if (adzunaRes.ok) {
            const adzunaData = await adzunaRes.json();
            for (const item of adzunaData.results || []) {
              const rawTitle = (item.title || "").replace(/(<([^>]+)>)/gi, "").trim();
              const rawDesc = (item.description || "").replace(/(<([^>]+)>)/gi, "").trim();
              const catLabel = item.category?.label || "Software";
              const cleanComp = cleanCompanyName(item.company?.display_name, item.company?.canonical_name);

              const countForComp = companyFrequency.get(cleanComp.toLowerCase()) || 0;
              if (countForComp >= 2) continue; // Max 2 per company

              const skills = extractSkillsFromText(rawTitle, rawDesc, catLabel);
              const salaryMin = typeof item.salary_min === 'number' && item.salary_min > 0 ? Math.round(item.salary_min) : undefined;
              const salaryMax = typeof item.salary_max === 'number' && item.salary_max > 0 ? Math.round(item.salary_max) : undefined;
              const isPred = item.salary_is_predicted ? String(item.salary_is_predicted) : undefined;
              const contractTime = item.contract_time ? String(item.contract_time) : undefined;
              const contractType = item.contract_type ? String(item.contract_type) : undefined;
              const salary = formatSalary(salaryMin, salaryMax, isPred, rawDesc, rawTitle, contractTime, contractType);

              jobsToProcess.push({
                title: rawTitle,
                company: cleanComp,
                category: catLabel.includes("IT") || catLabel.includes("Engineering") ? "Software" : catLabel,
                location: item.location?.display_name || "US",
                is_remote:
                  rawTitle.toLowerCase().includes("remote") ||
                  rawDesc.toLowerCase().includes("remote"),
                apply_url: item.redirect_url,
                description: rawDesc || `Software engineering opening at ${cleanComp}.`,
                required_skills: skills,
                salary,
                salary_min: salaryMin,
                salary_max: salaryMax,
                salary_is_predicted: isPred,
                contract_time: contractTime,
                contract_type: contractType,
                posted_at: item.created ? new Date(item.created).toISOString() : new Date().toISOString(),
              });

              companyFrequency.set(cleanComp.toLowerCase(), countForComp + 1);
            }
          }
        } catch (err) {
          console.warn("[Adzuna Error]:", err);
        }
      }
    }

    let newIngested = 0;
    let duplicatesSkipped = 0;

    for (const raw of jobsToProcess) {
      const jobHash = await generateJobHash(raw.company, raw.title, raw.apply_url);

      const { data: existing } = await supabase
        .from("jobs")
        .select("id")
        .eq("job_hash", jobHash)
        .maybeSingle();

      if (existing) {
        duplicatesSkipped++;
        continue;
      }

      const embeddingText = `Job Title: ${raw.title}\nCompany: ${raw.company}\nCategory: ${raw.category}\nLocation: ${raw.location || (raw.is_remote ? "Remote" : "On-site")}\nRequired Skills: ${raw.required_skills.join(", ")}\nDescription: ${raw.description}`;
      const embedding = await generateEmbedding(embeddingText, geminiKey);

      const { error: insertError } = await supabase.from("jobs").insert({
        job_hash: jobHash,
        title: raw.title,
        company: raw.company,
        category: raw.category,
        is_remote: raw.is_remote,
        location: raw.location || (raw.is_remote ? "Remote" : "On-site"),
        apply_url: raw.apply_url,
        description: raw.description,
        required_skills: raw.required_skills,
        salary: raw.salary,
        salary_min: raw.salary_min,
        salary_max: raw.salary_max,
        salary_is_predicted: raw.salary_is_predicted,
        contract_time: raw.contract_time,
        contract_type: raw.contract_type,
        posted_at: raw.posted_at || new Date().toISOString(),
        embedding: embedding ? JSON.stringify(embedding) : null,
      });

      if (!insertError) newIngested++;
    }

    const payload = {
      status: "success",
      totalScraped: jobsToProcess.length,
      newIngested,
      duplicatesSkipped,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    console.log("[ingest-jobs] Completed:", payload);

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ status: "error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
