import type { CatalogItem } from "@/lib/ba13/catalog";
import type { Ba13Config, CloisonInput } from "@/lib/ba13/types";

export interface ProjectMeta {
  name: string;
  client: string;
  chantier: string;
  reference: string;
  date: string; // ISO yyyy-mm-dd
}

export interface SavedProject {
  id: string;
  updatedAt: number;
  meta: ProjectMeta;
  moduleId: "ba13" | "mdf" | "aluminium";
  input: CloisonInput;
  config: Ba13Config;
  catalog: CatalogItem[];
}

const KEY = "ba13-pro.projects.v1";

export function loadProjects(): SavedProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedProject[]) : [];
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

export function persistProjects(list: SavedProject[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* quota / mode privé : sauvegarde ignorée */
  }
}

export function upsertProject(project: SavedProject): SavedProject[] {
  const list = loadProjects().filter((p) => p.id !== project.id);
  const next = [project, ...list].sort((a, b) => b.updatedAt - a.updatedAt);
  persistProjects(next);
  return next;
}

export function removeProject(id: string): SavedProject[] {
  const next = loadProjects().filter((p) => p.id !== id);
  persistProjects(next);
  return next;
}
