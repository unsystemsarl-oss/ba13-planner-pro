import type {
  Assumptions,
  CalcResult,
  CloisonInput,
  MaterialLine,
  PriceMap,
  ProjectType,
} from "./types";
import { TVA_RATE } from "./defaults";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Nombre de parements (faces recouvertes de plaques) selon le type d'ouvrage. */
export function facesFor(type: ProjectType): number {
  return type === "doublage" ? 1 : 2;
}

/** Nombre de couches de plaques par face, forcé à 2 pour la cloison double parement. */
export function layersFor(type: ProjectType, layers: 1 | 2): number {
  if (type === "cloison_double") return 2;
  return layers;
}

export interface Calculator {
  id: ProjectType;
  compute: (input: CloisonInput, a: Assumptions) => CalcResult;
}

function computeCloison(input: CloisonInput, a: Assumptions): CalcResult {
  const warnings: string[] = [];
  const { length: L, height: H, studSpacing, wastePercent } = input;
  const spacing = studSpacing / 100;
  const waste = 1 + wastePercent / 100;

  const grossArea = L * H;
  const openingArea = input.openings.reduce(
    (s, o) => s + o.width * o.height * Math.max(0, o.quantity),
    0,
  );
  const netArea = Math.max(0, grossArea - openingArea);
  if (openingArea > grossArea) warnings.push("La surface des ouvertures dépasse la surface brute.");
  if (H > a.boardLength)
    warnings.push(
      `Hauteur (${H} m) supérieure à la longueur de plaque (${a.boardLength} m) : joints horizontaux à prévoir.`,
    );

  const faces = facesFor(input.projectType);
  const layers = layersFor(input.projectType, input.layersPerSide);
  const boardArea = netArea * faces * layers;

  const lines: MaterialLine[] = [];

  // Plaques
  const boardUnit = a.boardWidth * a.boardLength;
  const boardsQty = (boardArea * waste) / boardUnit;
  lines.push({
    key: "plaque",
    label: `Plaque de plâtre BA13 (${a.boardWidth}×${a.boardLength} m)`,
    unit: "plaque",
    quantity: round2(boardsQty),
    purchase: Math.ceil(boardsQty),
    note: `${round2(boardArea * waste)} m² de parement (${faces} face(s) × ${layers} couche(s))`,
  });

  // Rails : haut + bas (doublage : idem, 1 ossature)
  const railMl = L * 2 * waste;
  lines.push({
    key: "rail",
    label: `Rail ${input.profile.split("/")[1]} (${a.profileLength} m)`,
    unit: "barre",
    quantity: round2(railMl / a.profileLength),
    purchase: Math.ceil(railMl / a.profileLength),
    note: `${round2(railMl)} ml (haut + bas)`,
  });

  // Montants
  const studCount = Math.floor(L / spacing) + 1;
  const studMl = studCount * H * waste;
  lines.push({
    key: "montant",
    label: `Montant ${input.profile.split("/")[0]} (${a.profileLength} m)`,
    unit: "barre",
    quantity: round2(studMl / a.profileLength),
    purchase: Math.ceil(studMl / a.profileLength),
    note: `${studCount} montants à ${studSpacing} cm d'entraxe`,
  });

  // Vis à plaques : périmètre + appuis intermédiaires
  const screwsPerBoardM2 = (1 / spacing) * (1 / a.screwSpacing) + a.screwsPerM2Extra;
  const screws = boardArea * waste * screwsPerBoardM2;
  lines.push({
    key: "vis_plaque",
    label: "Vis à plaques (boîte de 1000)",
    unit: "boîte",
    quantity: round2(screws / 1000),
    purchase: Math.ceil(screws / 1000),
    note: `≈ ${Math.ceil(screws)} vis (entraxe ${a.screwSpacing * 100} cm)`,
  });

  // Vis métal ossature
  const metalScrews = studCount * 4 * waste;
  lines.push({
    key: "vis_metal",
    label: "Vis métal / pinces d'assemblage (boîte de 500)",
    unit: "boîte",
    quantity: round2(metalScrews / 500),
    purchase: Math.ceil(metalScrews / 500),
    note: `≈ ${Math.ceil(metalScrews)} fixations d'ossature`,
  });

  // Chevilles de fixation des rails
  const fixings = Math.ceil((L * 2) / a.railFixingSpacing) + 2;
  lines.push({
    key: "cheville",
    label: "Chevilles + vis de fixation des rails",
    unit: "u",
    quantity: fixings,
    purchase: fixings,
    note: `Entraxe max ${a.railFixingSpacing * 100} cm`,
  });

  // Bande à joint
  const tapeMl = boardArea * a.tapeMlPerM2 * waste;
  lines.push({
    key: "bande",
    label: "Bande à joint (rouleau 150 ml)",
    unit: "rouleau",
    quantity: round2(tapeMl / 150),
    purchase: Math.ceil(tapeMl / 150),
    note: `≈ ${Math.ceil(tapeMl)} ml`,
  });

  // Enduit
  const compoundKg = boardArea * a.compoundKgPerM2 * waste;
  lines.push({
    key: "enduit",
    label: "Enduit à joint (sac 25 kg)",
    unit: "sac",
    quantity: round2(compoundKg / 25),
    purchase: Math.ceil(compoundKg / 25),
    note: `≈ ${Math.ceil(compoundKg)} kg`,
  });

  // Isolant
  if (input.insulation) {
    const insulM2 = netArea * a.insulationOverlap * waste;
    lines.push({
      key: "isolant",
      label: "Isolant (laine minérale)",
      unit: "m²",
      quantity: round2(insulM2),
      purchase: Math.ceil(insulM2),
      note: `Recouvrement ×${a.insulationOverlap}`,
    });
  }

  return {
    grossArea: round2(grossArea),
    openingArea: round2(openingArea),
    netArea: round2(netArea),
    boardArea: round2(boardArea),
    lines,
    warnings,
  };
}

/** Registre modulaire : ajouter ici les futurs types d'ouvrage (faux plafond, etc.). */
export const CALCULATORS: Partial<Record<ProjectType, Calculator>> = {
  cloison_simple: { id: "cloison_simple", compute: computeCloison },
  cloison_double: { id: "cloison_double", compute: computeCloison },
  doublage: { id: "doublage", compute: computeCloison },
};

export function calculate(input: CloisonInput, a: Assumptions): CalcResult | null {
  const calc = CALCULATORS[input.projectType];
  if (!calc) return null;
  return calc.compute(input, a);
}

export function costing(lines: MaterialLine[], prices: PriceMap) {
  const rows = lines.map((l) => ({
    ...l,
    unitPrice: prices[l.key] ?? 0,
    total: round2(l.purchase * (prices[l.key] ?? 0)),
  }));
  const ht = round2(rows.reduce((s, r) => s + r.total, 0));
  const tva = round2(ht * TVA_RATE);
  return { rows, ht, tva, ttc: round2(ht + tva) };
}

export const formatMAD = (n: number) =>
  new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) +
  " MAD";
