import type { SystemProfile } from "./systems";

export type ProjectType = "cloison_simple" | "cloison_double" | "faux_plafond" | "doublage";

export type StudSpacing = 40 | 60;
export type ProfileSize = "M48/R48" | "M70/R70" | "M100/R100";

export interface Opening {
  id: string;
  label: string;
  width: number; // m
  height: number; // m
  quantity: number;
}

export interface CloisonInput {
  projectType: ProjectType;
  length: number; // m
  height: number; // m
  studSpacing: StudSpacing;
  profile: ProfileSize;
  layersPerSide: 1 | 2;
  insulation: boolean;
  openings: Opening[];
  wastePercent: number;
}

/** Configuration système : profil fabricant retenu (copie éditable). */
export interface Ba13Config {
  system: SystemProfile;
}

/** Résultat purement géométrique, indépendant de tout système constructif. */
export interface Geometry {
  grossArea: number;
  openingArea: number;
  netArea: number;
  faces: number;
  layers: number;
  boardArea: number;
  studCount: number;
  railRunMl: number;
  railRuns: number;
  openingCount: number;
  openingLintelMl: number;
  openingJambMl: number;
}

export type PriceMap = Record<string, number>;
