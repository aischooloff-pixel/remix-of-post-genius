import { Product, categories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const IconComponent = (Icons[product.icon as keyof typeof Icons] as LucideIcon) || Icons.Package;
  const category = categories[product.category];

  return (
    <div className="product-card group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-foreground/5 transition-colors">
          <IconComponent className="w-6 h-6 text-foreground/70" />
        </div>
        {product.popular && (
          <Badge variant="secondary" className="text-xs">
            Популярное
          </Badge>
        )}
      </div>

      <div className="mb-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {category.name}
        </span>
        <h3 className="text-lg font-semibold mt-1 group-hover:text-foreground/80 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {product.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <span className="text-lg font-bold">
          {product.price.toLocaleString('ru-RU')} ₽
        </span>
        <Button 
          size="sm" 
          onClick={() => onAddToCart?.(product)}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          В корзину
        </Button>
      </div>
    </div>
  );
}
