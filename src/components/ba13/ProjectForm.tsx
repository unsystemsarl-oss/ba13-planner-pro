import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROFILE_SIZES, PROJECT_TYPES } from "@/lib/ba13/defaults";
import type { CloisonInput, Opening, ProjectType, StudSpacing } from "@/lib/ba13/types";

interface Props {
  value: CloisonInput;
  onChange: (v: CloisonInput) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="label-tech text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function ProjectForm({ value, onChange }: Props) {
  const set = <K extends keyof CloisonInput>(k: K, v: CloisonInput[K]) =>
    onChange({ ...value, [k]: v });

  const updateOpening = (id: string, patch: Partial<Opening>) =>
    set(
      "openings",
      value.openings.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    );

  const addOpening = () =>
    set("openings", [
      ...value.openings,
      {
        id: crypto.randomUUID(),
        label: "Porte",
        width: 0.9,
        height: 2.1,
        quantity: 1,
      },
    ]);

  const doubleLocked = value.projectType === "cloison_double";

  return (
    <div className="space-y-5">
      <Field label="Type d'ouvrage">
        <Select
          value={value.projectType}
          onValueChange={(v) => set("projectType", v as ProjectType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_TYPES.map((p) => (
              <SelectItem key={p.value} value={p.value} disabled={!p.available}>
                {p.label}
                {!p.available && " — bientôt"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Longueur (m)">
          <Input
            type="number"
            min={0}
            step={0.1}
            value={value.length}
            onChange={(e) => set("length", Number(e.target.value))}
          />
        </Field>
        <Field label="Hauteur (m)">
          <Input
            type="number"
            min={0}
            step={0.1}
            value={value.height}
            onChange={(e) => set("height", Number(e.target.value))}
          />
        </Field>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Entraxe montants">
          <Select
            value={String(value.studSpacing)}
            onValueChange={(v) => set("studSpacing", Number(v) as StudSpacing)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60">60 cm (courant)</SelectItem>
              <SelectItem value="40">40 cm (renforcé)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Profilé">
          <Select value={value.profile} onValueChange={(v) => set("profile", v as never)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROFILE_SIZES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Couches par face">
          <Select
            value={String(doubleLocked ? 2 : value.layersPerSide)}
            onValueChange={(v) => set("layersPerSide", Number(v) as 1 | 2)}
            disabled={doubleLocked}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 plaque</SelectItem>
              <SelectItem value="2">2 plaques</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Chute / pertes (%)">
          <Input
            type="number"
            min={0}
            max={50}
            step={1}
            value={value.wastePercent}
            onChange={(e) => set("wastePercent", Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2.5">
        <Label className="label-tech text-[11px]">Isolation en âme</Label>
        <Switch
          checked={value.insulation}
          onCheckedChange={(c) => set("insulation", c)}
          aria-label="Isolation"
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="label-tech text-[11px] text-muted-foreground">
            Ouvertures (portes / fenêtres)
          </Label>
          <Button type="button" size="sm" variant="outline" onClick={addOpening}>
            <Plus className="size-3.5" /> Ajouter
          </Button>
        </div>

        {value.openings.length === 0 && (
          <p className="text-xs text-muted-foreground">Aucune ouverture déclarée.</p>
        )}

        {value.openings.map((o) => (
          <div key={o.id} className="rounded-md border border-border bg-card p-3 space-y-2">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <Input
                value={o.label}
                onChange={(e) => updateOpening(o.id, { label: e.target.value })}
                className="h-8 min-w-0"
                placeholder="Libellé"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 shrink-0 text-destructive"
                onClick={() =>
                  set(
                    "openings",
                    value.openings.filter((x) => x.id !== o.id),
                  )
                }
                aria-label="Supprimer l'ouverture"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                step={0.05}
                min={0}
                className="h-8"
                value={o.width}
                onChange={(e) => updateOpening(o.id, { width: Number(e.target.value) })}
                aria-label="Largeur (m)"
              />
              <Input
                type="number"
                step={0.05}
                min={0}
                className="h-8"
                value={o.height}
                onChange={(e) => updateOpening(o.id, { height: Number(e.target.value) })}
                aria-label="Hauteur (m)"
              />
              <Input
                type="number"
                step={1}
                min={1}
                className="h-8"
                value={o.quantity}
                onChange={(e) => updateOpening(o.id, { quantity: Number(e.target.value) })}
                aria-label="Quantité"
              />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Largeur · Hauteur · Quantité
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
