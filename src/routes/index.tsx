import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  HardHat,
  Layers,
  Package,
  Printer,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ProjectForm } from "@/components/ba13/ProjectForm";
import { SystemPanel } from "@/components/ba13/SystemPanel";
import { CatalogPanel } from "@/components/ba13/CatalogPanel";
import { WorkspacePanel } from "@/components/ba13/WorkspacePanel";
import { DEFAULT_CATALOG } from "@/lib/ba13/catalog";
import { INITIAL_INPUT, PROJECT_TYPES } from "@/lib/ba13/defaults";
import { MODULES, ba13Module, costing, formatMAD } from "@/lib/ba13/engine";
import { SYSTEMS } from "@/lib/ba13/systems";
import type { Ba13Config, CloisonInput } from "@/lib/ba13/types";
import {
  loadProjects,
  removeProject,
  upsertProject,
  type ProjectMeta,
  type SavedProject,
} from "@/lib/workspace/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BA13 Calculateur Pro — Métré, systèmes et devis plaques de plâtre" },
      {
        name: "description",
        content:
          "Métré BA13 par système constructif : plaques, ossature, fixations, joints et isolant. Catalogue matériaux éditable, prix en MAD, TVA 20 %, devis imprimable.",
      },
      { property: "og:title", content: "BA13 Calculateur Pro" },
      {
        property: "og:description",
        content:
          "Calcul de matériaux pour cloisons et doublages BA13, catalogue fournisseur, limites système paramétrables et devis prêt à imprimer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const INITIAL_META: ProjectMeta = {
  name: "Nouveau projet",
  client: "",
  chantier: "",
  reference: "",
  date: new Date().toISOString().slice(0, 10),
};

const initialConfig = (): Ba13Config => ({ system: structuredClone(SYSTEMS[0]!) });

function Index() {
  const [moduleId, setModuleId] = useState<string>("ba13");
  const [input, setInput] = useState<CloisonInput>(INITIAL_INPUT);
  const [config, setConfig] = useState<Ba13Config>(initialConfig);
  const [catalog, setCatalog] = useState(structuredClone(DEFAULT_CATALOG));
  const [meta, setMeta] = useState<ProjectMeta>(INITIAL_META);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => setProjects(loadProjects()), []);

  const result = useMemo(() => ba13Module.compute(input, config), [input, config]);
  const cost = useMemo(() => (result ? costing(result.lines, catalog) : null), [result, catalog]);

  const reset = () => {
    setInput(INITIAL_INPUT);
    setConfig(initialConfig());
    setCatalog(structuredClone(DEFAULT_CATALOG));
    setMeta({ ...INITIAL_META, date: new Date().toISOString().slice(0, 10) });
    setCurrentId(null);
  };

  const save = () => {
    const id = currentId ?? crypto.randomUUID();
    setCurrentId(id);
    setProjects(
      upsertProject({ id, updatedAt: Date.now(), meta, moduleId: "ba13", input, config, catalog }),
    );
  };

  const load = (p: SavedProject) => {
    setCurrentId(p.id);
    setMeta(p.meta);
    setInput(p.input);
    setConfig(p.config);
    setCatalog(p.catalog);
  };

  const typeLabel =
    PROJECT_TYPES.find((p) => p.value === input.projectType)?.label ?? input.projectType;

  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <HardHat className="size-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-bold uppercase tracking-wide">
                BA13 Calculateur Pro
              </h1>
              <p className="truncate text-xs text-sidebar-foreground/70">
                Métré, systèmes constructifs et devis matériaux
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={reset}>
              <RotateCcw className="size-4" />{" "}
              <span className="hidden sm:inline">Réinitialiser</span>
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="size-4" /> <span className="hidden sm:inline">Devis / Imprimer</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 p-4 lg:grid-cols-[400px_minmax(0,1fr)] lg:p-6">
        {/* ---------------- Colonne de saisie ---------------- */}
        <section className="no-print space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base uppercase">
                <Layers className="size-4 text-accent" /> Module métier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODULES.map((m) => (
                    <SelectItem key={m.id} value={m.id} disabled={!m.available}>
                      {m.label}
                      {!m.available && " — bientôt"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base uppercase">
                <Calculator className="size-4 text-accent" /> Paramètres du projet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectForm value={input} onChange={setInput} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Accordion type="multiple">
                <AccordionItem value="workspace">
                  <AccordionTrigger className="text-sm uppercase tracking-wide">
                    <span className="flex items-center gap-2">
                      <HardHat className="size-4 text-accent" /> Espace projet
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <WorkspacePanel
                      meta={meta}
                      onMetaChange={setMeta}
                      projects={projects}
                      onSave={save}
                      onLoad={load}
                      onDelete={(id) => setProjects(removeProject(id))}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="system">
                  <AccordionTrigger className="text-sm uppercase tracking-wide">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="size-4 text-accent" /> Système & hypothèses
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <p className="mb-4 text-xs text-muted-foreground">
                      Le calcul géométrique est générique ; les consommations et limites ci-dessous
                      dépendent du système retenu et restent entièrement modifiables.
                    </p>
                    <SystemPanel
                      system={config.system}
                      input={input}
                      onChange={(system) => setConfig({ system })}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="catalog" className="border-none">
                  <AccordionTrigger className="text-sm uppercase tracking-wide">
                    <span className="flex items-center gap-2">
                      <Package className="size-4 text-accent" /> Catalogue matériaux
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <CatalogPanel catalog={catalog} onChange={setCatalog} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* ---------------- Résultats / devis ---------------- */}
        <section className="print-full space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base uppercase">
                Devis matériaux — {meta.name || "Projet sans titre"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <Info label="Client" value={meta.client || "—"} />
              <Info label="Chantier" value={meta.chantier || "—"} />
              <Info label="Référence" value={meta.reference || "—"} />
              <Info label="Date" value={meta.date} />
              <Info label="Ouvrage" value={typeLabel} />
              <Info
                label="Système"
                value={`${config.system.manufacturer} — ${config.system.name}`}
              />
            </CardContent>
          </Card>

          {!result ? (
            <Alert>
              <AlertTriangle className="size-4" />
              <AlertDescription>
                Ce type d'ouvrage n'est pas encore pris en charge par le moteur de calcul.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base uppercase">Synthèse — {typeLabel}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {result.metrics.map((m) => (
                    <Stat key={m.label} label={m.label} value={m.value} accent={m.accent} />
                  ))}
                </CardContent>
              </Card>

              {result.warnings.map((w) => (
                <Alert
                  key={w.message}
                  className={
                    w.level === "limit"
                      ? "border-destructive bg-destructive/10"
                      : w.level === "warning"
                        ? "border-warning bg-warning/15"
                        : "border-border"
                  }
                >
                  <AlertTriangle className="size-4" />
                  <AlertDescription className="space-y-1">
                    <div>{w.message}</div>
                    {w.source && (
                      <div className="label-tech text-[10px] text-muted-foreground">{w.source}</div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base uppercase">Liste d'achat détaillée</CardTitle>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="label-tech text-[11px]">Matériau</TableHead>
                          <TableHead className="label-tech text-right text-[11px]">
                            Calculé
                          </TableHead>
                          <TableHead className="label-tech text-right text-[11px]">
                            À acheter
                          </TableHead>
                          <TableHead className="label-tech text-right text-[11px]">
                            P.U. (MAD)
                          </TableHead>
                          <TableHead className="label-tech text-right text-[11px]">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cost!.rows.map((r) => (
                          <TableRow key={r.key}>
                            <TableCell className="min-w-[220px]">
                              <div className="font-medium">{r.label}</div>
                              {r.note && (
                                <div className="text-xs text-muted-foreground">{r.note}</div>
                              )}
                              {r.item.supplier && (
                                <div className="label-tech text-[10px] text-muted-foreground">
                                  Fournisseur : {r.item.supplier}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="num whitespace-nowrap text-right text-muted-foreground">
                              {r.baseQuantity} {r.baseUnit}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right">
                              <Badge variant="secondary" className="num">
                                {r.packages} {r.item.packageUnit}
                              </Badge>
                              <div className="text-[10px] text-muted-foreground">
                                {r.item.packageSize} {r.baseUnit} / {r.item.packageUnit}
                              </div>
                            </TableCell>
                            <TableCell className="num text-right">
                              {formatMAD(r.unitPrice)}
                            </TableCell>
                            <TableCell className="num text-right font-semibold">
                              {formatMAD(r.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="px-4 pt-3 text-xs text-muted-foreground sm:px-0">
                    Prix unitaires et conditionnements se modifient dans le catalogue matériaux.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base uppercase">Estimation du coût</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="ml-auto max-w-sm space-y-2 text-sm">
                    <Row label="Total HT" value={formatMAD(cost!.ht)} />
                    <Row label="TVA 20 %" value={formatMAD(cost!.tva)} />
                    <Separator />
                    <div className="flex items-center justify-between rounded-md bg-accent px-3 py-2.5 text-accent-foreground">
                      <span className="label-tech text-xs">Total TTC</span>
                      <span className="num text-lg font-bold">{formatMAD(cost!.ttc)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Alert className="border-blueprint/40 bg-blueprint/5">
            <AlertTriangle className="size-4" />
            <AlertDescription className="text-xs leading-relaxed">
              <strong>Avertissement :</strong> les quantités et les coûts affichés sont{" "}
              <strong>indicatifs</strong>. Le moteur sépare le calcul géométrique générique des
              règles propres à un système constructif : tant qu'une limite ou une consommation n'est
              pas vérifiée sur la documentation technique du fabricant, elle est exposée comme
              hypothèse modifiable. Les renforts d'ouvertures (linteaux, jambages), suspentes et
              accessoires spécifiques ne sont pas encore quantifiés.
            </AlertDescription>
          </Alert>
        </section>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="label-tech text-[10px] text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-md border p-3 ${accent ? "border-accent/50 bg-accent/10" : "border-border bg-muted/40"}`}
    >
      <div className="label-tech text-[10px] text-muted-foreground">{label}</div>
      <div className="num mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="num font-semibold">{value}</span>
    </div>
  );
}
