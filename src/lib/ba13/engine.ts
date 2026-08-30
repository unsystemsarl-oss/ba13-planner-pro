import type { CalcWarning, ModuleResult, ProjectModule, QuantityLine } from "@/lib/modules/types";
import { DEFAULT_CATALOG, type CatalogItem } from "./catalog";
import { computeGeometry } from "./geometry";
import { findLimit } from "./systems";
import type { Ba13Config, CloisonInput } from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;
export const TVA_RATE = 0.2;

export function computeBa13(input: CloisonInput, config: Ba13Config): ModuleResult | null {
  if (!["cloison_simple", "cloison_double", "doublage"].includes(input.projectType)) return null;

  const sys = config.system;
  const c = sys.consumption;
  const g = computeGeometry(input);
  const waste = 1 + Math.max(0, input.wastePercent) / 100;
  const warnings: CalcWarning[] = [];
  const lines: QuantityLine[] = [];

  // ---------- Contrôles de cohérence ----------
  if (g.openingArea > g.grossArea) {
    warnings.push({
      level: "warning",
      message: "La surface des ouvertures dépasse la surface brute de l'ouvrage.",
      source: "Contrôle géométrique",
    });
  }
  if (input.height > sys.boardLength) {
    warnings.push({
      level: "info",
      message: `Hauteur (${input.height} m) supérieure à la longueur de plaque (${sys.boardLength} m) : joints horizontaux à prévoir, non comptés séparément.`,
      source: "Contrôle géométrique",
    });
  }

  const limit = findLimit(sys, input.profile, input.studSpacing, input.layersPerSide);
  if (limit) {
    if (input.height > limit.maxHeight) {
      warnings.push({
        level: "limit",
        message: `Hauteur ${input.height} m supérieure à la limite paramétrée de ${limit.maxHeight} m pour ${input.profile} · entraxe ${input.studSpacing} cm · ${input.layersPerSide} couche(s). Réduisez l'entraxe, changez de profilé ou vérifiez le système retenu.`,
        source: limit.verified
          ? `${sys.manufacturer} — documentation technique`
          : `${sys.manufacturer} — limite non vérifiée, hypothèse modifiable`,
      });
    } else if (!limit.verified) {
      warnings.push({
        level: "info",
        message: `Limite de hauteur retenue : ${limit.maxHeight} m (valeur de saisie non vérifiée sur la documentation ${sys.manufacturer}).`,
        source: "Hypothèse modifiable",
      });
    }
  } else {
    warnings.push({
      level: "info",
      message: "Aucune limite d'emploi renseignée pour cette combinaison profilé / entraxe / couches.",
      source: "Hypothèse manquante",
    });
  }

  if (g.openingCount > 0) {
    warnings.push({
      level: "warning",
      message: `${g.openingCount} ouverture(s) déduite(s) de la surface de parement (${round2(g.openingArea)} m²). Les renforts de linteaux et de jambages (≈ ${round2(g.openingLintelMl)} ml de linteaux et ${round2(g.openingJambMl)} ml de jambages) ne sont pas encore quantifiés : à ajouter manuellement selon le système retenu.`,
      source: "Limite connue du moteur",
    });
  }

  // ---------- Plaques ----------
  const boardUnit = sys.boardWidth * sys.boardLength;
  const boards = boardUnit > 0 ? (g.boardArea * waste) / boardUnit : 0;
  lines.push({
    key: "plaque",
    label: `Plaque de plâtre BA13 (${sys.boardWidth}×${sys.boardLength} m)`,
    baseUnit: "u",
    baseQuantity: round2(boards),
    note: `${round2(g.boardArea * waste)} m² de parement — ${g.faces} face(s) × ${g.layers} couche(s), chute ${input.wastePercent} %`,
  });

  // ---------- Rails : calepinage réel des barres ----------
  const barsPerRun = input.length > 0 ? Math.ceil(input.length / sys.profileLength) : 0;
  const railMl = g.railRuns * barsPerRun * sys.profileLength;
  lines.push({
    key: "rail",
    label: `Rail ${input.profile.split("/")[1]}`,
    baseUnit: "ml",
    baseQuantity: round2(railMl),
    note: `${g.railRuns} files de ${round2(g.railRunMl)} ml — ${barsPerRun} barre(s) de ${sys.profileLength} m par file`,
  });

  // ---------- Montants : calepinage réel ----------
  const barsPerStud = input.height > 0 ? Math.ceil(input.height / sys.profileLength) : 0;
  const studMl = g.studCount * barsPerStud * sys.profileLength;
  lines.push({
    key: "montant",
    label: `Montant ${input.profile.split("/")[0]}`,
    baseUnit: "ml",
    baseQuantity: round2(studMl),
    note: `${g.studCount} montants à ${input.studSpacing} cm d'entraxe × ${barsPerStud} barre(s) de ${sys.profileLength} m`,
  });

  // ---------- Vis à plaques ----------
  const fieldScrews = (1 / (input.studSpacing / 100)) * (1 / c.screwSpacingField);
  const edgePerimeterPerM2 = (2 * (sys.boardWidth + sys.boardLength)) / boardUnit;
  const edgeScrews = (edgePerimeterPerM2 / c.screwSpacingEdge) * 0.5; // rives partagées entre plaques
  const screwsPerM2 = fieldScrews + edgeScrews + c.screwsPerM2Extra;
  const screws = g.boardArea * waste * screwsPerM2;
  lines.push({
    key: "vis_plaque",
    label: "Vis à plaques",
    baseUnit: "u",
    baseQuantity: Math.ceil(screws),
    note: `≈ ${round2(screwsPerM2)} vis/m² (rives ${c.screwSpacingEdge * 100} cm, courant ${c.screwSpacingField * 100} cm)`,
  });

  // ---------- Fixations d'ossature ----------
  const metalScrews = Math.ceil(g.studCount * c.metalFixingsPerStud);
  lines.push({
    key: "vis_metal",
    label: "Vis métal / pinces d'assemblage",
    baseUnit: "u",
    baseQuantity: metalScrews,
    note: `${c.metalFixingsPerStud} fixation(s) par montant`,
  });

  // ---------- Chevilles de fixation des rails (implantation réelle) ----------
  const fixingsPerRun =
    input.length > 0 ? Math.floor(input.length / c.railFixingSpacing) + 1 : 0;
  const fixings = fixingsPerRun * g.railRuns;
  lines.push({
    key: "cheville",
    label: "Chevilles + vis de fixation des rails",
    baseUnit: "u",
    baseQuantity: fixings,
    note: `${fixingsPerRun} points par file × ${g.railRuns} files — entraxe max ${c.railFixingSpacing * 100} cm`,
  });

  // ---------- Traitement des joints ----------
  const tapeMl = g.boardArea * c.tapeMlPerM2 * waste;
  lines.push({
    key: "bande",
    label: "Bande à joint",
    baseUnit: "ml",
    baseQuantity: round2(tapeMl),
    note: `${c.tapeMlPerM2} ml/m² de parement`,
  });

  const compoundKg = g.boardArea * c.compoundKgPerM2 * waste;
  lines.push({
    key: "enduit",
    label: "Enduit à joint",
    baseUnit: "kg",
    baseQuantity: round2(compoundKg),
    note: `${c.compoundKgPerM2} kg/m² de parement`,
  });

  // ---------- Isolation ----------
  if (input.insulation) {
    const insulM2 = g.netArea * c.insulationOverlap * waste;
    lines.push({
      key: "isolant",
      label: "Isolant (laine minérale)",
      baseUnit: "m²",
      baseQuantity: round2(insulM2),
      note: `Recouvrement ×${c.insulationOverlap}`,
    });
  }

  return {
    metrics: [
      { label: "Surface brute", value: `${round2(g.grossArea)} m²` },
      { label: "Ouvertures", value: `${round2(g.openingArea)} m²` },
      { label: "Surface nette", value: `${round2(g.netArea)} m²` },
      { label: "Parement total", value: `${round2(g.boardArea)} m²`, accent: true },
    ],
    lines,
    warnings,
  };
}

export const ba13Module: ProjectModule<CloisonInput, Ba13Config> = {
  id: "ba13",
  label: "BA13 — plaques de plâtre",
  available: true,
  defaultCatalog: DEFAULT_CATALOG,
  compute: computeBa13,
};

export const MODULES = [
  ba13Module,
  { id: "mdf" as const, label: "MDF — panneaux bois", available: false },
  { id: "aluminium" as const, label: "Aluminium — profilés", available: false },
];

export interface CostRow extends QuantityLine {
  item: CatalogItem;
  packages: number;
  unitPrice: number;
  total: number;
}

export function costing(lines: QuantityLine[], catalog: CatalogItem[]) {
  const rows: CostRow[] = lines.map((l) => {
    const item =
      catalog.find((i) => i.key === l.key) ??
      ({
        key: l.key,
        label: l.label,
        category: "plaque",
        baseUnit: l.baseUnit,
        packageSize: 1,
        packageUnit: "u",
        price: 0,
        supplier: "",
      } as CatalogItem);
    const size = item.packageSize > 0 ? item.packageSize : 1;
    const packages = Math.ceil(l.baseQuantity / size);
    return { ...l, item, packages, unitPrice: item.price, total: round2(packages * item.price) };
  });
  const ht = round2(rows.reduce((s, r) => s + r.total, 0));
  const tva = round2(ht * TVA_RATE);
  return { rows, ht, tva, ttc: round2(ht + tva) };
}

export const formatMAD = (n: number) =>
  new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) +
  " MAD";
