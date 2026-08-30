import type { CloisonInput, Geometry, ProjectType } from "./types";

/** Nombre de parements (faces recouvertes de plaques) selon le type d'ouvrage. */
export function facesFor(type: ProjectType): number {
  return type === "doublage" ? 1 : 2;
}

/** Nombre de couches de plaques par face, forcé à 2 pour la cloison double parement. */
export function layersFor(type: ProjectType, layers: 1 | 2): number {
  if (type === "cloison_double") return 2;
  return layers;
}

/**
 * Calcul géométrique générique : surfaces, nombre de montants, linéaires de rails.
 * Aucune règle fabricant n'intervient ici.
 */
export function computeGeometry(input: CloisonInput): Geometry {
  const { length: L, height: H, studSpacing } = input;
  const spacing = studSpacing / 100;

  const grossArea = Math.max(0, L * H);
  const openings = input.openings.filter((o) => o.quantity > 0);
  const openingArea = openings.reduce(
    (s, o) => s + Math.max(0, o.width) * Math.max(0, o.height) * o.quantity,
    0,
  );
  const netArea = Math.max(0, grossArea - openingArea);

  const faces = facesFor(input.projectType);
  const layers = layersFor(input.projectType, input.layersPerSide);
  const boardArea = netArea * faces * layers;

  const studCount = L > 0 && spacing > 0 ? Math.floor(L / spacing) + 1 : 0;
  const railRuns = 2; // rail haut + rail bas
  const railRunMl = L;

  const openingCount = openings.reduce((s, o) => s + o.quantity, 0);
  const openingLintelMl = openings.reduce((s, o) => s + o.width * o.quantity, 0);
  const openingJambMl = openings.reduce((s, o) => s + o.height * 2 * o.quantity, 0);

  return {
    grossArea,
    openingArea,
    netArea,
    faces,
    layers,
    boardArea,
    studCount,
    railRunMl,
    railRuns,
    openingCount,
    openingLintelMl,
    openingJambMl,
  };
}
