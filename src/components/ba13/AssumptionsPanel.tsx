import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ASSUMPTION_LABELS } from "@/lib/ba13/defaults";
import type { Assumptions } from "@/lib/ba13/types";

interface Props {
  value: Assumptions;
  onChange: (v: Assumptions) => void;
}

export function AssumptionsPanel({ value, onChange }: Props) {
  const keys = Object.keys(ASSUMPTION_LABELS) as (keyof Assumptions)[];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {keys.map((k) => (
        <div key={k} className="space-y-1.5">
          <Label className="label-tech text-[11px] text-muted-foreground">
            {ASSUMPTION_LABELS[k].label} ({ASSUMPTION_LABELS[k].unit})
          </Label>
          <Input
            type="number"
            step={0.05}
            min={0}
            className="num h-9"
            value={value[k]}
            onChange={(e) => onChange({ ...value, [k]: Number(e.target.value) })}
          />
        </div>
      ))}
    </div>
  );
}
