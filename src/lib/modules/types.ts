/**
 * Interface commune à tous les modules métier (ba13, mdf, aluminium…).
 * Chaque module fournit ses types d'ouvrage, son moteur de calcul et son catalogue par défaut.
 */
import type { CatalogItem } from "@/lib/ba13/catalog";

export type ModuleId = "ba13" | "mdf" | "aluminium";

export interface QuantityLine {
  /** Clé de rattachement à un article du catalogue. */
  key: string;
  label: string;
  /** Unité de calcul (u, ml, m², kg). */
  baseUnit: string;
  /** Quantité calculée en unité de base, chute incluse. */
  baseQuantity: number;
  note?: string;
}

export type WarningLevel = "info" | "warning" | "limit";

export interface CalcWarning {
  level: WarningLevel;
  message: string;
  /** Source de la règle (documentation fabricant, hypothèse utilisateur…). */
  source?: string;
}

export interface ModuleResult {
  metrics: { label: string; value: string; accent?: boolean }[];
  lines: QuantityLine[];
  warnings: CalcWarning[];
}

export interface ProjectModule<TInput, TConfig> {
  id: ModuleId;
  label: string;
  available: boolean;
  defaultCatalog: CatalogItem[];
  compute: (input: TInput, config: TConfig) => ModuleResult | null;
}
