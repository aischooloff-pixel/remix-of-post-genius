import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Category } from "@/data/products";

interface HeroProps {
  onCategoryChange?: (category: Category | null) => void;
}

export function Hero({ onCategoryChange }: HeroProps) {
  return (
    <section className="py-16 md:py-24 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Все для автоматизации
            <br />
            <span className="text-muted-foreground">и продвижения</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl">
            Скрипты, инструменты, товары и услуги для эффективной работы в интернете. 
            Качественные решения по доступным ценам.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              onClick={() => onCategoryChange?.(null)}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Каталог
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onCategoryChange?.('scripts')}
            >
              Скрипты
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
