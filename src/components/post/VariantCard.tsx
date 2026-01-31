import { Check, FileText, Zap, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostVariant } from "@/types/post";

interface VariantCardProps {
  variant: PostVariant;
  isSelected?: boolean;
  onSelect: () => void;
}

const styleConfig: Record<
  PostVariant["style"],
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  hook: {
    icon: Zap,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
  guide: {
    icon: FileText,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  promo: {
    icon: ShoppingBag,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
};

export function VariantCard({ variant, isSelected, onSelect }: VariantCardProps) {
  const config = styleConfig[variant.style];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-5 transition-all duration-300 cursor-pointer group",
        "hover:border-primary/50 hover:shadow-lg",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", config.bgColor)}>
            <Icon className={cn("w-5 h-5", config.color)} />
          </div>
          <div>
            <h3 className="font-semibold">{variant.styleName}</h3>
            <p className="text-xs text-muted-foreground">Вариант {variant.label}</p>
          </div>
        </div>
        
        {isSelected && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-scale-in">
            <Check className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Text Preview */}
      <div className="mb-4 p-3 bg-secondary/50 rounded-lg">
        <p className="text-sm text-foreground/90 line-clamp-4 whitespace-pre-wrap">
          {variant.text}
        </p>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="secondary" className="text-xs">
          {variant.text.length} символов
        </Badge>
        <Badge variant="secondary" className="text-xs">
          ~{variant.tokensUsed} токенов
        </Badge>
      </div>

      {/* Select Button */}
      <Button
        variant={isSelected ? "default" : "outline"}
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isSelected ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Выбран
          </>
        ) : (
          "Выбрать этот вариант"
        )}
      </Button>
    </div>
  );
}