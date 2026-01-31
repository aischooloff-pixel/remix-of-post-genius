import { PostVariant } from "@/types/post";
import { VariantCard } from "./VariantCard";

interface VariantsListProps {
  variants: PostVariant[];
  selectedVariantId?: string;
  onSelectVariant: (variantId: string) => void;
}

export function VariantsList({
  variants,
  selectedVariantId,
  onSelectVariant,
}: VariantsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Выберите вариант</h2>
        <p className="text-sm text-muted-foreground">
          Сгенерировано {variants.length} варианта
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {variants.map((variant) => (
          <VariantCard
            key={variant.id}
            variant={variant}
            isSelected={variant.id === selectedVariantId}
            onSelect={() => onSelectVariant(variant.id)}
          />
        ))}
      </div>
    </div>
  );
}