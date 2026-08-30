import type { CloisonInput } from "./types";

export const PROJECT_TYPES: { value: string; label: string; available: boolean }[] = [
  { value: "cloison_simple", label: "Cloison simple parement", available: true },
  { value: "cloison_double", label: "Cloison double parement", available: true },
  { value: "doublage", label: "Doublage sur ossature", available: true },
  { value: "faux_plafond", label: "Faux plafond", available: false },
];

export const PROFILE_SIZES = ["M48/R48", "M70/R70", "M100/R100"];

export const INITIAL_INPUT: CloisonInput = {
  projectType: "cloison_simple",
  length: 5,
  height: 2.5,
  studSpacing: 60,
  profile: "M48/R48",
  layersPerSide: 1,
  insulation: true,
  openings: [],
  wastePercent: 10,
};
