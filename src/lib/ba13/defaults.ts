import type { Assumptions, PriceMap } from "./types";

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  boardWidth: 1.2,
  boardLength: 2.5,
  profileLength: 3,
  railFixingSpacing: 0.6,
  screwSpacing: 0.3,
  screwsPerM2Extra: 2,
  tapeMlPerM2: 1.5,
  compoundKgPerM2: 0.9,
  insulationOverlap: 1.05,
  boardsPerBox: 1,
};

export const ASSUMPTION_LABELS: Record<keyof Assumptions, { label: string; unit: string }> = {
  boardWidth: { label: "Largeur d'une plaque", unit: "m" },
  boardLength: { label: "Longueur d'une plaque", unit: "m" },
  profileLength: { label: "Longueur commerciale des profilés", unit: "m" },
  railFixingSpacing: { label: "Entraxe fixations de rails (max)", unit: "m" },
  screwSpacing: { label: "Entraxe des vis", unit: "m" },
  screwsPerM2Extra: { label: "Vis supplémentaires (marge)", unit: "u/m²" },
  tapeMlPerM2: { label: "Bande à joint", unit: "ml/m²" },
  compoundKgPerM2: { label: "Enduit à joint", unit: "kg/m²" },
  insulationOverlap: { label: "Coefficient de recouvrement isolant", unit: "×" },
  boardsPerBox: { label: "Plaques par lot d'achat", unit: "u" },
};

/** Prix unitaires indicatifs en MAD — entièrement modifiables par l'utilisateur. */
export const DEFAULT_PRICES: PriceMap = {
  plaque: 75,
  rail: 38,
  montant: 42,
  vis_plaque: 55,
  vis_metal: 45,
  cheville: 1.5,
  bande: 25,
  enduit: 90,
  isolant: 60,
};

export const TVA_RATE = 0.2;

export const PROJECT_TYPES: { value: string; label: string; available: boolean }[] = [
  { value: "cloison_simple", label: "Cloison simple parement", available: true },
  { value: "cloison_double", label: "Cloison double parement", available: true },
  { value: "doublage", label: "Doublage sur ossature", available: true },
  { value: "faux_plafond", label: "Faux plafond", available: false },
];

export const PROFILE_SIZES = ["M48/R48", "M70/R70", "M100/R100"];
