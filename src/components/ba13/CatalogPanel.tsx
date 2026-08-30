import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABELS, type CatalogItem, type CatalogCategory } from "@/lib/ba13/catalog";

interface Props {
  catalog: CatalogItem[];
  onChange: (c: CatalogItem[]) => void;
}

export function CatalogPanel({ catalog, onChange }: Props) {
  const patch = (key: string, p: Partial<CatalogItem>) =>
    onChange(catalog.map((i) => (i.key === key ? { ...i, ...p } : i)));

  const categories = Object.keys(CATEGORY_LABELS) as CatalogCategory[];

  return (
    <div className="space-y-5">
      {categories.map((cat) => {
        const items = catalog.filter((i) => i.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} className="space-y-3">
            <p className="label-tech text-[11px] text-accent">{CATEGORY_LABELS[cat]}</p>
            {items.map((i) => (
              <div key={i.key} className="rounded-md border border-border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{i.label}</span>
                  <span className="num text-[11px] text-muted-foreground">{i.baseUnit}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Cell label="Conditionnement">
                    <Input
                      className="num h-8"
                      type="number"
                      min={0.01}
                      step={0.5}
                      value={i.packageSize}
                      onChange={(e) => patch(i.key, { packageSize: Number(e.target.value) })}
                    />
                  </Cell>
                  <Cell label="Unité d'achat">
                    <Input
                      className="h-8"
                      value={i.packageUnit}
                      onChange={(e) => patch(i.key, { packageUnit: e.target.value })}
                    />
                  </Cell>
                  <Cell label="Prix (MAD)">
                    <Input
                      className="num h-8"
                      type="number"
                      min={0}
                      step={0.5}
                      value={i.price}
                      onChange={(e) => patch(i.key, { price: Number(e.target.value) })}
                    />
                  </Cell>
                  <Cell label="Fournisseur">
                    <Input
                      className="h-8"
                      value={i.supplier}
                      placeholder="—"
                      onChange={(e) => patch(i.key, { supplier: e.target.value })}
                    />
                  </Cell>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="label-tech text-[10px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
