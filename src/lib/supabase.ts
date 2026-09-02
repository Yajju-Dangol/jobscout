import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Job, UserProfile } from '../types';
import { extractSkillsFromJob } from './skillsExtractor';
import { formatSalaryRange } from './salaryFormatter';

export const FIXED_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Generate a standard RFC-4122 v4 UUID
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Check if a given string is a valid standard UUID format
 */
export function isValidUUID(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

export interface DatabaseProfile {
  id: string;
  full_name: string | null;
  title: string | null;
  skills: string[] | null;
  raw_text: string | null;
  embedding: number[] | string | null;
  updated_at?: string;
}

export interface DatabaseJob {
  id: string;
  job_hash: string;
  title: string;
  company: string;
  category: string;
  is_remote: boolean;
  location: string | null;
  apply_url: string;
  description: string;
  required_skills: string[] | null;
  salary?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_is_predicted?: string | null;
  contract_time?: string | null;
  contract_type?: string | null;
  posted_at?: string;
  embedding: number[] | string | null;
  created_at?: string;
}

// Client-side local persistence cache
const LOCAL_STORAGE_PROFILE_PREFIX = 'jobscout_user_profile_';
const LOCAL_STORAGE_JOBS_KEY = 'jobscout_cached_jobs_v1';
const LOCAL_STORAGE_AUTH_USER_KEY = 'jobscout_auth_user_v1';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    'https://fbcicalhwceufdyqcuyc.supabase.co'
  )?.trim();

  const key = (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && (process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_SERVICE_ROLE_KEY)) ||
    ''
  )?.trim();

  if (
    !url ||
    !key ||
    url.includes('your-project.supabase.co') ||
    url.includes('example.com') ||
    key.includes('your-anon-key') ||
    key.length < 20 ||
    !url.startsWith('https://')
  ) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.warn('[Supabase Client Init Note]:', err);
    return null;
  }
}

/**
 * Sign in with Google via Supabase OAuth
 */
export async function signInWithGoogle(): Promise<{ error?: any; url?: string | null }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: new Error('Supabase client not initialized') };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.warn('[Supabase Google Sign-In Note]:', error);
      return { error };
    }

    return { url: data?.url };
  } catch (err: any) {
    console.warn('[Supabase Google Sign-In Exception]:', err);
    return { error: err };
  }
}

/**
 * Sign out current authenticated user
 */
export async function signOutUser(): Promise<{ error?: any }> {
  const supabase = getSupabaseClient();
  try {
    localStorage.removeItem(LOCAL_STORAGE_AUTH_USER_KEY);
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('[Supabase Sign-Out Note]:', error);
    }
    return {};
  } catch (err: any) {
    console.warn('[Sign-out Exception]:', err);
    return { error: err };
  }
}

/**
 * Get active user session
 */
export async function getActiveAuthUser(): Promise<{
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
} | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: { session }, error: sessError } = await supabase.auth.getSession();
      if (!sessError && session?.user) {
        const u = session.user;
        const name =
          u.user_metadata?.full_name ||
          u.user_metadata?.name ||
          u.user_metadata?.given_name ||
          (u.email ? u.email.split('@')[0] : 'Google User');
        const authUser = {
          id: u.id,
          email: u.email,
          name,
          avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture,
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_AUTH_USER_KEY, JSON.stringify(authUser));
        } catch {}
        return authUser;
      }
    } catch (err) {
      console.warn('[Supabase getActiveAuthUser Note]:', err);
    }
  }

  // Fallback to local session storage
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_AUTH_USER_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  return null;
}

/**
 * Store demo/instant authenticated user for seamless testing
 */
export function setCachedAuthUser(user: { id: string; email?: string; name?: string; avatarUrl?: string } | null) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_AUTH_USER_KEY);
    }
  } catch {}
}

/**
 * Parses vector embedding from Array, JSON string, or Postgres string "[0.1, 0.2]"
 */
export function parseVector(raw: any): number[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    return raw.map((v) => Number(v)).filter((v) => !isNaN(v));
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((v) => Number(v)).filter((v) => !isNaN(v));
        }
      } catch {
        const items = trimmed.slice(1, -1).split(',');
        const nums = items.map((s) => Number(s.trim())).filter((v) => !isNaN(v));
        if (nums.length > 0) return nums;
      }
    }
  }
  return null;
}

/**
 * Generate 32-character SHA-256 hash in browser
 */
export async function generateJobHash(company: string, title: string, applyUrl: string): Promise<string> {
  const norm = `${company.toLowerCase().trim()}::${title.toLowerCase().trim()}::${applyUrl.trim()}`;
  try {
    const msgUint8 = new TextEncoder().encode(norm);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  } catch {
    // Simple hash fallback
    let hash = 0;
    for (let i = 0; i < norm.length; i++) {
      hash = (hash << 5) - hash + norm.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }
}

/**
 * Fetch candidate profile from Supabase profiles table
 */
export async function loadProfileFromSupabase(userId?: string): Promise<DatabaseProfile | null> {
  const supabase = getSupabaseClient();
  
  if (supabase && userId && isValidUUID(userId)) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return data as DatabaseProfile;
      }
    } catch (err) {
      console.warn('[Supabase load profile note]:', err);
    }
  }

  // Fallback to localStorage per user
  if (userId) {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${userId}`);
      if (saved) {
        return JSON.parse(saved) as DatabaseProfile;
      }
    } catch {}
  }

  return null;
}

/**
 * Upsert candidate profile directly into Supabase profiles table
 */
export async function saveProfileToSupabase(profile: {
  id?: string;
  fullName: string;
  title: string;
  skills: string[];
  rawText?: string;
  embedding?: number[] | null;
}): Promise<DatabaseProfile> {
  const id = (profile.id && isValidUUID(profile.id)) ? profile.id : generateUUID();
  const payload: DatabaseProfile = {
    id,
    full_name: profile.fullName,
    title: profile.title,
    skills: profile.skills,
    raw_text: profile.rawText || '',
    embedding: profile.embedding || null,
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('profiles').upsert({
        id: payload.id,
        full_name: payload.full_name,
        title: payload.title,
        skills: payload.skills,
        raw_text: payload.raw_text,
        embedding: payload.embedding ? JSON.stringify(payload.embedding) : null,
        updated_at: payload.updated_at,
      });
    } catch (err) {
      console.warn('[Supabase save profile note]:', err);
    }
  }

  // Persist locally per user in browser
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${id}`, JSON.stringify(payload));
  } catch {}

  return payload;
}

/**
 * Fetch all jobs directly from Supabase jobs table
 */
export async function fetchJobsFromSupabase(limit: number = 1000): Promise<DatabaseJob[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        // Cache locally
        try {
          localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(data));
        } catch {}
        return data as DatabaseJob[];
      }
    } catch (err) {
      console.warn('[Supabase fetch jobs note]:', err);
    }
  }

  // Fallback to cached jobs in localStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_JOBS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as DatabaseJob[];
      }
    }
  } catch {}

  return [];
}

/**
 * Call Supabase Postgres Vector RPC match_jobs_for_user safely
 */
export async function matchJobsWithSupabaseRpc(
  userId?: string,
  threshold: number = 0.0,
  limit: number = 1000
): Promise<any[] | null> {
  if (!userId || !isValidUUID(userId)) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // Only attempt RPC if the profile exists in Supabase and has an embedding
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('id, embedding')
      .eq('id', userId)
      .maybeSingle();

    if (profErr || !prof || !prof.embedding) {
      return null;
    }

    const { data, error } = await supabase.rpc('match_jobs_for_user', {
      target_user_id: userId,
      match_threshold: threshold,
      match_count: limit,
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Silent fallback to standard Supabase jobs fetch & client vector scoring
  }

  return null;
}

/**
 * Clear all jobs from Supabase database
 */
export async function clearJobsFromSupabase(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err) {
      console.warn('[Supabase clear jobs note]:', err);
    }
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_JOBS_KEY);
  } catch {}

  return true;
}
