import { createClient } from '@supabase/supabase-js';
import { Database as SupabaseDatabase } from '../src/types/supabase';
import Database from 'better-sqlite3';
import path from 'path';
import 'dotenv/config';

// 1. Initialize SQLite (Fallback/Local Cache)
const dbPath = path.join(process.cwd(), 'projects.db');
const sqlite = new Database(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, name)
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    messages TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS custom_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    personality TEXT NOT NULL,
    base_model TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 2. Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient<SupabaseDatabase>(supabaseUrl, supabaseKey)
  : null;

if (!supabase) {
  console.warn("Supabase credentials not found. Using SQLite only.");
}

// --- PROJECTS ---

export const getProjects = async (sessionId?: string) => {
  if (supabase) {
    const query = supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (sessionId) query.eq('session_id', sessionId);
    const { data, error } = await query;
    if (!error) return data;
    console.error("Supabase error getting projects:", JSON.stringify(error, null, 2));
  }
  
  // Fallback to SQLite
  const stmt = sessionId 
    ? sqlite.prepare('SELECT * FROM projects WHERE session_id = ? ORDER BY created_at DESC')
    : sqlite.prepare('SELECT * FROM projects ORDER BY created_at DESC');
  return sessionId ? stmt.all(sessionId) : stmt.all();
};

export const createProject = async (sessionId: string, name: string, content: string, language: string) => {
  let result;
  if (supabase) {
    const { data, error } = await (supabase.from('projects') as any)
      .upsert([{ session_id: sessionId, name, content, language }], { onConflict: 'session_id,name' })
      .select().single();
    if (!error) result = data;
    else console.error("Supabase error upserting project:", JSON.stringify(error, null, 2));
  }

  // Always sync to SQLite as well
  const stmt = sqlite.prepare(`
    INSERT INTO projects (session_id, name, content, language)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(session_id, name) DO UPDATE SET
      content = excluded.content,
      language = excluded.language
  `);
  stmt.run(sessionId, name, content, language);
  
  if (!result) {
    result = sqlite.prepare('SELECT * FROM projects WHERE session_id = ? AND name = ?').get(sessionId, name);
  }
  return result;
};

export const deleteProject = async (id: number) => {
  if (supabase) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) console.error("Supabase error deleting project:", JSON.stringify(error, null, 2));
  }
  sqlite.prepare('DELETE FROM projects WHERE id = ?').run(id);
};

// --- SESSIONS ---

export const getSessions = async () => {
  if (supabase) {
    const { data, error } = await (supabase.from('sessions') as any).select('*').order('updated_at', { ascending: false });
    if (!error) return data.map((s: any) => ({ ...s, messages: typeof s.messages === 'string' ? JSON.parse(s.messages) : s.messages }));
    console.error("Supabase error getting sessions:", JSON.stringify(error, null, 2));
  }
  const rows = sqlite.prepare('SELECT * FROM sessions ORDER BY updated_at DESC').all();
  return rows.map((r: any) => ({ ...r, messages: JSON.parse(r.messages) }));
};

export const upsertSession = async (session: any) => {
  if (supabase) {
    const { error } = await (supabase.from('sessions') as any).upsert({
      id: session.id,
      title: session.title,
      messages: session.messages,
      updated_at: session.updatedAt || Date.now()
    });
    if (error) console.error("Supabase error upserting session:", JSON.stringify(error, null, 2));
  }
  sqlite.prepare(`
    INSERT INTO sessions (id, title, messages, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      messages = excluded.messages,
      updated_at = excluded.updated_at
  `).run(session.id, session.title, JSON.stringify(session.messages), session.updatedAt || Date.now());
};

export const deleteSession = async (id: string) => {
  if (supabase) {
    const { error } = await (supabase.from('sessions') as any).delete().eq('id', id);
    if (error) console.error("Supabase error deleting session:", JSON.stringify(error, null, 2));
  }
  sqlite.prepare('DELETE FROM sessions WHERE id = ?').run(id);
};

// --- CUSTOM MODELS ---

export const getCustomModels = async () => {
  if (supabase) {
    const { data, error } = await (supabase.from('custom_models') as any).select('*').order('created_at', { ascending: false });
    if (!error) return data;
    console.error("Supabase error getting custom models:", JSON.stringify(error, null, 2));
  }
  return sqlite.prepare('SELECT * FROM custom_models ORDER BY created_at DESC').all();
};

export const upsertCustomModel = async (model: any) => {
  if (supabase) {
    const { error } = await (supabase.from('custom_models') as any).upsert({
      name: model.name,
      personality: model.personality,
      base_model: model.baseModel
    });
    if (error) console.error("Supabase error upserting custom model:", JSON.stringify(error, null, 2));
  }
  sqlite.prepare(`
    INSERT INTO custom_models (name, personality, base_model)
    VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      personality = excluded.personality,
      base_model = excluded.base_model
  `).run(model.name, model.personality, model.baseModel);
};
