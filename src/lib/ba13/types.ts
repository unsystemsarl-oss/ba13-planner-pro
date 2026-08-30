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

/** Hypothèses de calcul entièrement paramétrables (aucune valeur figée). */
export interface Assumptions {
  boardWidth: number; // m
  boardLength: number; // m
  profileLength: number; // m — longueur commerciale des profilés
  railFixingSpacing: number; // m — entraxe max des fixations de rails
  screwSpacing: number; // m — entraxe des vis
  screwsPerM2Extra: number; // vis supplémentaires / m² (marge)
  tapeMlPerM2: number; // ml de bande / m² de plaque
  compoundKgPerM2: number; // kg d'enduit / m² de plaque
  insulationOverlap: number; // coefficient de recouvrement isolant
  boardsPerBox: number; // non utilisé pour l'achat, indicatif
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

export interface MaterialLine {
  key: string;
  label: string;
  unit: string;
  quantity: number; // quantité calculée (avec chute)
  purchase: number; // quantité d'achat arrondie
  note?: string;
}

export interface CalcResult {
  grossArea: number;
  openingArea: number;
  netArea: number;
  boardArea: number;
  lines: MaterialLine[];
  warnings: string[];
}

export type PriceMap = Record<string, number>;
