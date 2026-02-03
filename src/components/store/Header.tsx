import { Link } from "react-router-dom";
import { ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { categories, Category } from "@/data/products";

interface HeaderProps {
  cartCount?: number;
  activeCategory?: Category | null;
  onCategoryChange?: (category: Category | null) => void;
}

export function Header({ cartCount = 0, activeCategory, onCategoryChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categoryList = Object.entries(categories) as [Category, { name: string; icon: string }][];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">TEMKA.STORE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={activeCategory === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onCategoryChange?.(null)}
              className="text-sm font-medium"
            >
              Все
            </Button>
            {categoryList.map(([key, { name }]) => (
              <Button
                key={key}
                variant={activeCategory === key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onCategoryChange?.(key)}
                className="text-sm font-medium"
              >
                {name}
              </Button>
            ))}
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background text-xs font-medium rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-2 mt-8">
                  <Button
                    variant={activeCategory === null ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => {
                      onCategoryChange?.(null);
                      setMobileMenuOpen(false);
                    }}
                  >
                    Все товары
                  </Button>
                  {categoryList.map(([key, { name }]) => (
                    <Button
                      key={key}
                      variant={activeCategory === key ? "secondary" : "ghost"}
                      className="justify-start"
                      onClick={() => {
                        onCategoryChange?.(key);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {name}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
