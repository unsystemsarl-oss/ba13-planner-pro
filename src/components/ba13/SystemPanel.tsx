import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CONSUMPTION_LABELS,
  SYSTEMS,
  getSystem,
  type ConsumptionProfile,
  type SystemProfile,
} from "@/lib/ba13/systems";
import type { CloisonInput } from "@/lib/ba13/types";

interface Props {
  system: SystemProfile;
  input: CloisonInput;
  onChange: (s: SystemProfile) => void;
}

export function SystemPanel({ system, input, onChange }: Props) {
  const keys = Object.keys(CONSUMPTION_LABELS) as (keyof ConsumptionProfile)[];

  const setConsumption = (k: keyof ConsumptionProfile, v: number) =>
    onChange({ ...system, consumption: { ...system.consumption, [k]: v } });

  const limitIndex = system.limits.findIndex(
    (l) =>
      l.profile === input.profile &&
      l.studSpacing === input.studSpacing &&
      l.layersPerSide === input.layersPerSide,
  );
  const limit = limitIndex >= 0 ? system.limits[limitIndex] : undefined;

  const setLimit = (maxHeight: number) => {
    if (limitIndex < 0) return;
    const limits = system.limits.map((l, i) => (i === limitIndex ? { ...l, maxHeight } : l));
    onChange({ ...system, limits });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="label-tech text-[11px] text-muted-foreground">Fabricant / système</Label>
        <Select value={system.id} onValueChange={(v) => onChange(structuredClone(getSystem(v)))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SYSTEMS.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.manufacturer} — {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs leading-relaxed text-muted-foreground">{system.sourceNote}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Num
          label="Largeur plaque (m)"
          value={system.boardWidth}
          onChange={(v) => onChange({ ...system, boardWidth: v })}
        />
        <Num
          label="Longueur plaque (m)"
          value={system.boardLength}
          onChange={(v) => onChange({ ...system, boardLength: v })}
        />
        <Num
          label="Longueur profilé (m)"
          value={system.profileLength}
          onChange={(v) => onChange({ ...system, profileLength: v })}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Label className="label-tech text-[11px] text-muted-foreground">
            Limite de hauteur — {input.profile} · {input.studSpacing} cm · {input.layersPerSide}{" "}
            couche(s)
          </Label>
          {limit && (
            <Badge variant={limit.verified ? "secondary" : "outline"} className="text-[10px]">
              {limit.verified ? "Vérifiée" : "Non vérifiée"}
            </Badge>
          )}
        </div>
        {limit ? (
          <Input
            type="number"
            step={0.05}
            min={0}
            className="num h-9"
            value={limit.maxHeight}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
        ) : (
          <p className="text-xs text-muted-foreground">
            Combinaison non renseignée dans ce système.
          </p>
        )}
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="label-tech text-[11px] text-muted-foreground">
          Profil de consommation
        </Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {keys.map((k) => (
            <Num
              key={k}
              label={`${CONSUMPTION_LABELS[k].label} (${CONSUMPTION_LABELS[k].unit})`}
              value={system.consumption[k]}
              onChange={(v) => setConsumption(k, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="label-tech text-[11px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        step={0.05}
        min={0}
        className="num h-9"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
