import { useState } from "react";
import { Check, FileText, Zap, ShoppingBag, ChevronDown } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const config = styleConfig[variant.style];
  const Icon = config.icon;
  
  // Check if text is long enough to need expansion
  const isLongText = variant.text.length > 200;

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

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

      {/* Text Preview with Expand Animation */}
      <div className="mb-4 p-3 bg-secondary/50 rounded-lg relative overflow-hidden">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isExpanded ? "max-h-[500px]" : "max-h-24"
          )}
        >
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">
            {variant.text}
          </p>
        </div>
        
        {/* Gradient overlay when collapsed */}
        {isLongText && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-secondary/90 to-transparent pointer-events-none" />
        )}
        
        {/* Expand/Collapse button */}
        {isLongText && (
          <button
            onClick={handleExpandClick}
            className={cn(
              "absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors",
              "bg-secondary/80 px-2 py-1 rounded-full backdrop-blur-sm"
            )}
          >
            <span>{isExpanded ? "Свернуть" : "Читать полностью"}</span>
            <ChevronDown 
              className={cn(
                "w-3 h-3 transition-transform duration-300",
                isExpanded && "rotate-180"
              )} 
            />
          </button>
        )}
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