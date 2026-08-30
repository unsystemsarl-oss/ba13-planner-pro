import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Calculator, HardHat, Printer, RotateCcw, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { AssumptionsPanel } from "@/components/ba13/AssumptionsPanel";
import { DEFAULT_ASSUMPTIONS, DEFAULT_PRICES, PROJECT_TYPES } from "@/lib/ba13/defaults";
import { calculate, costing, formatMAD } from "@/lib/ba13/engine";
import type { Assumptions, CloisonInput, PriceMap } from "@/lib/ba13/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BA13 Calculateur Pro — Métré et coût des ouvrages en plaques de plâtre" },
      {
        name: "description",
        content:
          "Calculez plaques, rails, montants, vis, bandes, enduit et isolant pour vos cloisons et doublages BA13. Prix en MAD, TVA 20 %, liste d'achat imprimable.",
      },
      { property: "og:title", content: "BA13 Calculateur Pro" },
      {
        property: "og:description",
        content:
          "Métré et estimation de coût pour cloisons et doublages en plaques de plâtre BA13, en unités métriques et en MAD.",
      },
    ],
  }),
  component: Index,
});

const INITIAL_INPUT: CloisonInput = {
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

function Index() {
  const [input, setInput] = useState<CloisonInput>(INITIAL_INPUT);
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [prices, setPrices] = useState<PriceMap>(DEFAULT_PRICES);

  const result = useMemo(() => calculate(input, assumptions), [input, assumptions]);
  const cost = useMemo(
    () => (result ? costing(result.lines, prices) : null),
    [result, prices],
  );

  const reset = () => {
    setInput(INITIAL_INPUT);
    setAssumptions(DEFAULT_ASSUMPTIONS);
    setPrices(DEFAULT_PRICES);
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
                Métré et estimation matériaux — plaques de plâtre
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm" onClick={reset}>
              <RotateCcw className="size-4" /> <span className="hidden sm:inline">Réinitialiser</span>
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="size-4" /> <span className="hidden sm:inline">Imprimer</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 p-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:p-6">
        {/* ---------------- Formulaire ---------------- */}
        <section className="no-print space-y-5">
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
              <Accordion type="single" collapsible>
                <AccordionItem value="hyp" className="border-none">
                  <AccordionTrigger className="py-0 text-sm uppercase tracking-wide">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="size-4 text-accent" /> Hypothèses de calcul
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <p className="mb-4 text-xs text-muted-foreground">
                      Toutes les hypothèses sont modifiables. Adaptez-les au système constructif et
                      à la documentation technique du fabricant retenu.
                    </p>
                    <AssumptionsPanel value={assumptions} onChange={setAssumptions} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* ---------------- Résultats ---------------- */}
        <section className="print-full space-y-5">
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
                  <Stat label="Surface brute" value={`${result.grossArea} m²`} />
                  <Stat label="Ouvertures" value={`${result.openingArea} m²`} />
                  <Stat label="Surface nette" value={`${result.netArea} m²`} />
                  <Stat label="Parement total" value={`${result.boardArea} m²`} accent />
                </CardContent>
              </Card>

              {result.warnings.map((w) => (
                <Alert key={w} className="border-warning bg-warning/15">
                  <AlertTriangle className="size-4" />
                  <AlertDescription>{w}</AlertDescription>
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
                            <TableCell className="min-w-[200px]">
                              <div className="font-medium">{r.label}</div>
                              {r.note && (
                                <div className="text-xs text-muted-foreground">{r.note}</div>
                              )}
                            </TableCell>
                            <TableCell className="num text-right text-muted-foreground">
                              {r.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className="num">
                                {r.purchase} {r.unit}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={0}
                                step={0.5}
                                value={r.unitPrice}
                                onChange={(e) =>
                                  setPrices({ ...prices, [r.key]: Number(e.target.value) })
                                }
                                className="num ml-auto h-8 w-24 text-right"
                                aria-label={`Prix unitaire ${r.label}`}
                              />
                            </TableCell>
                            <TableCell className="num text-right font-semibold">
                              {formatMAD(r.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
              <strong>indicatifs</strong>. Ils reposent sur des hypothèses géométriques génériques et
              modifiables, et non sur les limites structurelles d'un système constructif particulier.
              Ils doivent être validés au regard du système fabricant retenu, de sa documentation
              technique (hauteurs limites, entraxes, épaisseurs, fixations) et des règles de l'art
              applicables au chantier. Les prix unitaires sont saisis par l'utilisateur.
            </AlertDescription>
          </Alert>
        </section>
      </main>
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
