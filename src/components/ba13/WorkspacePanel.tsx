import { FolderOpen, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ProjectMeta, SavedProject } from "@/lib/workspace/storage";

interface Props {
  meta: ProjectMeta;
  onMetaChange: (m: ProjectMeta) => void;
  projects: SavedProject[];
  onSave: () => void;
  onLoad: (p: SavedProject) => void;
  onDelete: (id: string) => void;
}

export function WorkspacePanel({
  meta,
  onMetaChange,
  projects,
  onSave,
  onLoad,
  onDelete,
}: Props) {
  const set = <K extends keyof ProjectMeta>(k: K, v: ProjectMeta[K]) =>
    onMetaChange({ ...meta, [k]: v });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom du projet">
          <Input value={meta.name} onChange={(e) => set("name", e.target.value)} className="h-9" />
        </Field>
        <Field label="Client">
          <Input
            value={meta.client}
            onChange={(e) => set("client", e.target.value)}
            className="h-9"
          />
        </Field>
        <Field label="Chantier">
          <Input
            value={meta.chantier}
            onChange={(e) => set("chantier", e.target.value)}
            className="h-9"
          />
        </Field>
        <Field label="Référence devis">
          <Input
            value={meta.reference}
            onChange={(e) => set("reference", e.target.value)}
            className="h-9"
          />
        </Field>
        <Field label="Date">
          <Input
            type="date"
            value={meta.date}
            onChange={(e) => set("date", e.target.value)}
            className="num h-9"
          />
        </Field>
      </div>

      <Button size="sm" onClick={onSave} className="w-full">
        <Save className="size-4" /> Enregistrer la configuration
      </Button>

      <Separator />

      <div className="space-y-2">
        <Label className="label-tech text-[11px] text-muted-foreground">
          Configurations enregistrées ({projects.length})
        </Label>
        {projects.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Aucune configuration enregistrée sur cet appareil.
          </p>
        )}
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-2 rounded-md border border-border bg-card p-2"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{p.meta.name || "Sans titre"}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {[p.meta.client, p.meta.chantier].filter(Boolean).join(" · ") || "—"}
              </div>
            </div>
            <Button size="icon" variant="ghost" className="size-8" onClick={() => onLoad(p)}>
              <FolderOpen className="size-4" />
              <span className="sr-only">Charger</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 text-destructive"
              onClick={() => onDelete(p.id)}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Supprimer</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="label-tech text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
