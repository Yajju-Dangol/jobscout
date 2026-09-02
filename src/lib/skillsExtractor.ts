/**
 * Advanced Technical Skills Extractor
 * Extracts accurate, distinct, high-signal engineering and domain skills from job titles & descriptions.
 */

export const TECH_SKILL_PATTERNS: { name: string; regex: RegExp; weight?: number }[] = [
  // Programming Languages
  { name: 'TypeScript', regex: /\b(typescript|ts)\b/i },
  { name: 'JavaScript', regex: /\b(javascript|js|es6|ecmascript)\b/i },
  { name: 'Python', regex: /\b(python|python3|py)\b/i },
  { name: 'Rust', regex: /\b(rust|rust-lang|cargo)\b/i },
  { name: 'Go', regex: /\b(golang|go\s+developer|go\s+backend|\bgo\b)\b/i },
  { name: 'Java', regex: /\b(java|jvm|spring\s*boot|spring)\b/i },
  { name: 'C++', regex: /\b(c\+\+|cpp)\b/i },
  { name: 'C#', regex: /\b(c#|csharp|\.net|dotnet|asp\.net)\b/i },
  { name: 'Ruby', regex: /\b(ruby|ruby\s+on\s+rails|rails)\b/i },
  { name: 'PHP', regex: /\b(php|laravel|symfony)\b/i },
  { name: 'Swift', regex: /\b(swift|swiftui|ios)\b/i },
  { name: 'Kotlin', regex: /\b(kotlin|android)\b/i },
  { name: 'SQL', regex: /\b(sql|mysql|postgresql|postgres|tsql|plsql)\b/i },
  { name: 'Scala', regex: /\b(scala|akka)\b/i },
  { name: 'R', regex: /\b(r\s+programming|r\s+language)\b/i },

  // Frontend & UI
  { name: 'React', regex: /\b(react|reactjs|react\.js)\b/i },
  { name: 'Next.js', regex: /\b(next\.?js|nextjs)\b/i },
  { name: 'Vue.js', regex: /\b(vue|vuejs|vue\.js|nuxt|nuxtjs)\b/i },
  { name: 'Angular', regex: /\b(angular|angularjs|angular\.js)\b/i },
  { name: 'Svelte', regex: /\b(svelte|sveltekit)\b/i },
  { name: 'Tailwind CSS', regex: /\b(tailwind|tailwindcss|tailwind\s+css)\b/i },
  { name: 'CSS / HTML', regex: /\b(css3?|html5?|sass|scss|less)\b/i },
  { name: 'GraphQL', regex: /\b(graphql|apollo|relay)\b/i },
  { name: 'WebSockets', regex: /\b(websockets?|socket\.io)\b/i },
  { name: 'Redux', regex: /\b(redux|zustand|mobx|recoil)\b/i },
  { name: 'Webpack / Vite', regex: /\b(vite|webpack|turbopack|rollup)\b/i },

  // Backend & APIs
  { name: 'Node.js', regex: /\b(node|nodejs|node\.js)\b/i },
  { name: 'Express', regex: /\b(express|expressjs|express\.js)\b/i },
  { name: 'FastAPI', regex: /\b(fastapi|fast-api)\b/i },
  { name: 'Django', regex: /\b(django|django\s+rest\s+framework|drf)\b/i },
  { name: 'Flask', regex: /\b(flask)\b/i },
  { name: 'NestJS', regex: /\b(nestjs|nest\.js)\b/i },
  { name: 'gRPC', regex: /\b(grpc|protobuf|protocol\s+buffers)\b/i },
  { name: 'REST APIs', regex: /\b(rest|restful|rest\s+api|apis?)\b/i },
  { name: 'Microservices', regex: /\b(microservices?|distributed\s+systems)\b/i },

  // Databases & Vector Search
  { name: 'PostgreSQL', regex: /\b(postgresql|postgres|psql|pgvector)\b/i },
  { name: 'MongoDB', regex: /\b(mongodb|mongo|mongoose)\b/i },
  { name: 'Redis', regex: /\b(redis|keydb|memcached)\b/i },
  { name: 'Supabase', regex: /\b(supabase)\b/i },
  { name: 'Firebase', regex: /\b(firebase|firestore)\b/i },
  { name: 'Vector Search', regex: /\b(vector\s+(search|database|index|embedding)|pgvector|pinecone|qdrant|chroma|weaviate|milvus)\b/i },
  { name: 'DynamoDB', regex: /\b(dynamodb|dynamo)\b/i },
  { name: 'Elasticsearch', regex: /\b(elasticsearch|elastic\s+search|opensearch)\b/i },
  { name: 'Snowflake', regex: /\b(snowflake|bigquery|redshift)\b/i },
  { name: 'Kafka', regex: /\b(kafka|rabbitmq|sqs|event-driven)\b/i },

  // Cloud & DevOps
  { name: 'AWS', regex: /\b(aws|amazon\s+web\s+services|ec2|s3|lambda|ecs|eks)\b/i },
  { name: 'GCP', regex: /\b(gcp|google\s+cloud|cloud\s+run|gke)\b/i },
  { name: 'Azure', regex: /\b(azure|microsoft\s+azure)\b/i },
  { name: 'Docker', regex: /\b(docker|containerization|containers?)\b/i },
  { name: 'Kubernetes', regex: /\b(kubernetes|k8s|helm)\b/i },
  { name: 'CI/CD', regex: /\b(ci\/cd|github\s+actions|jenkins|gitlab\s+ci|circleci)\b/i },
  { name: 'Terraform', regex: /\b(terraform|iac|infrastructure\s+as\s+code)\b/i },
  { name: 'Linux', regex: /\b(linux|unix|bash|shell\s+scripting)\b/i },

  // AI / ML & Data Science
  { name: 'PyTorch', regex: /\b(pytorch|torch)\b/i },
  { name: 'TensorFlow', regex: /\b(tensorflow|tf|keras)\b/i },
  { name: 'LLMs & GenAI', regex: /\b(llms?|large\s+language\s+models?|generative\s+ai|genai|gpt|gemini|rag|langchain|llamaindex|transformers|huggingface)\b/i },
  { name: 'Machine Learning', regex: /\b(machine\s+learning|\bml\b|scikit-learn|deep\s+learning)\b/i },
  { name: 'NLP', regex: /\b(nlp|natural\s+language\s+processing)\b/i },
  { name: 'Computer Vision', regex: /\b(computer\s+vision|opencv)\b/i },
  { name: 'Data Pipelines', regex: /\b(etl|data\s+pipeline|spark|pyspark|airflow|dbt|pandas|numpy)\b/i },

  // Mobile
  { name: 'React Native', regex: /\b(react\s+native|expo)\b/i },
  { name: 'Flutter', regex: /\b(flutter|dart)\b/i },
  { name: 'iOS', regex: /\b(ios|cocoa|xcode)\b/i },
  { name: 'Android', regex: /\b(android|android\s+sdk)\b/i },

  // System Design & Security
  { name: 'System Design', regex: /\b(system\s+design|scalability|high\s+availability|concurrency)\b/i },
  { name: 'Security & Auth', regex: /\b(oauth|oauth2|jwt|authentication|cybersecurity|crypto|zero-trust)\b/i },
  { name: 'Testing', regex: /\b(jest|cypress|playwright|unit\s+testing|tdd|pytest)\b/i },
];

/**
 * Extracts distinct, high-relevance technical skills from title and description.
 */
export function extractSkillsFromJob(
  title: string,
  description: string,
  category?: string
): string[] {
  const combined = `${title} ${description} ${category || ''}`.toLowerCase();
  const matchedSkills: string[] = [];

  for (const { name, regex } of TECH_SKILL_PATTERNS) {
    if (regex.test(combined)) {
      if (!matchedSkills.includes(name)) {
        matchedSkills.push(name);
      }
    }
  }

  // If few skills detected, infer smart category-specific default tech skills
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
    } else if (tLower.includes('ai') || tLower.includes('ml') || tLower.includes('machine learning') || tLower.includes('data')) {
      ['Python', 'PyTorch', 'LLMs & GenAI', 'Vector Search', 'Data Pipelines'].forEach(s => {
        if (!matchedSkills.includes(s)) matchedSkills.push(s);
      });
    } else if (tLower.includes('devops') || tLower.includes('cloud') || tLower.includes('infra') || tLower.includes('sre')) {
      ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'].forEach(s => {
        if (!matchedSkills.includes(s)) matchedSkills.push(s);
      });
    } else if (tLower.includes('mobile') || tLower.includes('ios') || tLower.includes('android')) {
      ['React Native', 'TypeScript', 'iOS', 'Android', 'Mobile'].forEach(s => {
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
