export type CatalogCategory =
  | "plaque"
  | "ossature"
  | "fixation"
  | "traitement_joint"
  | "isolation";

export interface CatalogItem {
  key: string;
  label: string;
  category: CatalogCategory;
  /** Unité de calcul (u, ml, m², kg). */
  baseUnit: string;
  /** Contenance d'un conditionnement, exprimée en unité de base (ex. barre de 3 ml). */
  packageSize: number;
  /** Libellé du conditionnement d'achat (barre, boîte, sac, rouleau…). */
  packageUnit: string;
  /** Prix unitaire du conditionnement, en MAD — saisi par l'utilisateur. */
  price: number;
  supplier: string;
}

export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  plaque: "Plaques",
  ossature: "Ossature",
  fixation: "Fixations",
  traitement_joint: "Traitement des joints",
  isolation: "Isolation",
};

/** Catalogue par défaut : conditionnements et prix indicatifs, tous modifiables. */
export const DEFAULT_CATALOG: CatalogItem[] = [
  {
    key: "plaque",
    label: "Plaque de plâtre BA13",
    category: "plaque",
    baseUnit: "u",
    packageSize: 1,
    packageUnit: "plaque",
    price: 75,
    supplier: "",
  },
  {
    key: "rail",
    label: "Rail d'ossature",
    category: "ossature",
    baseUnit: "ml",
    packageSize: 3,
    packageUnit: "barre",
    price: 38,
    supplier: "",
  },
  {
    key: "montant",
    label: "Montant d'ossature",
    category: "ossature",
    baseUnit: "ml",
    packageSize: 3,
    packageUnit: "barre",
    price: 42,
    supplier: "",
  },
  {
    key: "vis_plaque",
    label: "Vis à plaques",
    category: "fixation",
    baseUnit: "u",
    packageSize: 1000,
    packageUnit: "boîte",
    price: 55,
    supplier: "",
  },
  {
    key: "vis_metal",
    label: "Vis métal / pinces d'assemblage",
    category: "fixation",
    baseUnit: "u",
    packageSize: 500,
    packageUnit: "boîte",
    price: 45,
    supplier: "",
  },
  {
    key: "cheville",
    label: "Chevilles + vis de fixation des rails",
    category: "fixation",
    baseUnit: "u",
    packageSize: 100,
    packageUnit: "boîte",
    price: 60,
    supplier: "",
  },
  {
    key: "bande",
    label: "Bande à joint papier",
    category: "traitement_joint",
    baseUnit: "ml",
    packageSize: 150,
    packageUnit: "rouleau",
    price: 25,
    supplier: "",
  },
  {
    key: "enduit",
    label: "Enduit à joint",
    category: "traitement_joint",
    baseUnit: "kg",
    packageSize: 25,
    packageUnit: "sac",
    price: 90,
    supplier: "",
  },
  {
    key: "isolant",
    label: "Isolant (laine minérale)",
    category: "isolation",
    baseUnit: "m²",
    packageSize: 10,
    packageUnit: "rouleau",
    price: 320,
    supplier: "",
  },
];
