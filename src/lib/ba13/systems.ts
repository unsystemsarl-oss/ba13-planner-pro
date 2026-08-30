import type { ProfileSize, StudSpacing } from "./types";

/**
 * Profils de consommation et limites d'emploi par système constructif.
 *
 * IMPORTANT : aucune valeur n'est réputée officielle. Les limites de hauteur ci-dessous
 * sont des repères de saisie, marqués `verified: false` tant qu'ils n'ont pas été
 * confrontés à la documentation technique du fabricant (Placo, Siniat…).
 * Elles sont entièrement modifiables dans l'interface.
 */

export interface ConsumptionProfile {
  /** Entraxe des vis en rive de plaque (m). */
  screwSpacingEdge: number;
  /** Entraxe des vis en partie courante (m). */
  screwSpacingField: number;
  /** Vis supplémentaires par m² (marge de pose). */
  screwsPerM2Extra: number;
  /** Fixations d'ossature (vis métal / pinces) par montant. */
  metalFixingsPerStud: number;
  /** Entraxe maximal des fixations de rails au sol et au plafond (m). */
  railFixingSpacing: number;
  /** Bande à joint (ml/m² de parement). */
  tapeMlPerM2: number;
  /** Enduit à joint (kg/m² de parement). */
  compoundKgPerM2: number;
  /** Coefficient de recouvrement de l'isolant. */
  insulationOverlap: number;
}

export interface SystemLimit {
  profile: ProfileSize;
  studSpacing: StudSpacing;
  layersPerSide: 1 | 2;
  /** Hauteur maximale d'emploi (m). */
  maxHeight: number;
  verified: boolean;
}

export interface SystemProfile {
  id: string;
  manufacturer: string;
  name: string;
  /** Longueurs commerciales par défaut. */
  boardWidth: number;
  boardLength: number;
  profileLength: number;
  consumption: ConsumptionProfile;
  limits: SystemLimit[];
  sourceNote: string;
}

const GENERIC_CONSUMPTION: ConsumptionProfile = {
  screwSpacingEdge: 0.3,
  screwSpacingField: 0.3,
  screwsPerM2Extra: 2,
  metalFixingsPerStud: 4,
  railFixingSpacing: 0.6,
  tapeMlPerM2: 1.5,
  compoundKgPerM2: 0.9,
  insulationOverlap: 1.05,
};

const limits = (rows: [ProfileSize, StudSpacing, 1 | 2, number][]): SystemLimit[] =>
  rows.map(([profile, studSpacing, layersPerSide, maxHeight]) => ({
    profile,
    studSpacing,
    layersPerSide,
    maxHeight,
    verified: false,
  }));

const BASE_LIMITS = limits([
  ["M48/R48", 60, 1, 2.6],
  ["M48/R48", 40, 1, 3.0],
  ["M48/R48", 60, 2, 3.0],
  ["M48/R48", 40, 2, 3.4],
  ["M70/R70", 60, 1, 3.1],
  ["M70/R70", 40, 1, 3.6],
  ["M70/R70", 60, 2, 3.6],
  ["M70/R70", 40, 2, 4.1],
  ["M100/R100", 60, 1, 3.8],
  ["M100/R100", 40, 1, 4.3],
  ["M100/R100", 60, 2, 4.3],
  ["M100/R100", 40, 2, 5.0],
]);

export const SYSTEMS: SystemProfile[] = [
  {
    id: "generique",
    manufacturer: "Générique",
    name: "Système générique paramétrable",
    boardWidth: 1.2,
    boardLength: 2.5,
    profileLength: 3,
    consumption: { ...GENERIC_CONSUMPTION },
    limits: BASE_LIMITS,
    sourceNote:
      "Aucune règle fabricant appliquée. Toutes les valeurs sont des hypothèses de saisie à valider par l'utilisateur.",
  },
  {
    id: "placo",
    manufacturer: "Placo",
    name: "Cloison type Placostil® (à paramétrer)",
    boardWidth: 1.2,
    boardLength: 2.5,
    profileLength: 3,
    consumption: { ...GENERIC_CONSUMPTION },
    limits: BASE_LIMITS,
    sourceNote:
      "Gabarit de saisie inspiré de l'organisation des systèmes Placo. Les hauteurs limites et consommations ne sont pas encore vérifiées sur la documentation technique officielle : renseignez-les depuis le cahier de prescription du système retenu.",
  },
  {
    id: "siniat",
    manufacturer: "Siniat",
    name: "Cloison type Prégymétric / Siniat (à paramétrer)",
    boardWidth: 1.2,
    boardLength: 2.5,
    profileLength: 3,
    consumption: { ...GENERIC_CONSUMPTION },
    limits: BASE_LIMITS,
    sourceNote:
      "Gabarit de saisie inspiré de l'organisation des systèmes Siniat. Les hauteurs limites et consommations ne sont pas encore vérifiées sur la documentation technique officielle : renseignez-les depuis l'avis technique du système retenu.",
  },
];

export const getSystem = (id: string): SystemProfile =>
  SYSTEMS.find((s) => s.id === id) ?? SYSTEMS[0]!;

export function findLimit(
  system: SystemProfile,
  profile: ProfileSize,
  studSpacing: StudSpacing,
  layersPerSide: 1 | 2,
): SystemLimit | undefined {
  return system.limits.find(
    (l) =>
      l.profile === profile && l.studSpacing === studSpacing && l.layersPerSide === layersPerSide,
  );
}

export const CONSUMPTION_LABELS: Record<keyof ConsumptionProfile, { label: string; unit: string }> =
  {
    screwSpacingEdge: { label: "Entraxe vis en rive", unit: "m" },
    screwSpacingField: { label: "Entraxe vis partie courante", unit: "m" },
    screwsPerM2Extra: { label: "Vis supplémentaires (marge)", unit: "u/m²" },
    metalFixingsPerStud: { label: "Fixations d'ossature par montant", unit: "u" },
    railFixingSpacing: { label: "Entraxe fixations de rails", unit: "m" },
    tapeMlPerM2: { label: "Bande à joint", unit: "ml/m²" },
    compoundKgPerM2: { label: "Enduit à joint", unit: "kg/m²" },
    insulationOverlap: { label: "Recouvrement isolant", unit: "×" },
  };
