import { useState } from "react";
import { Header } from "@/components/store/Header";
import { Hero } from "@/components/store/Hero";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Footer } from "@/components/store/Footer";
import { Category, Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

export default function Store() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => [...prev, product]);
    toast({
      title: "Добавлено в корзину",
      description: product.name,
    });
  };

  const scrollToCatalog = () => {
    const catalog = document.getElementById("catalog");
    catalog?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCategoryChange = (category: Category | null) => {
    setActiveCategory(category);
    scrollToCatalog();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartItems.length}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <Hero onCategoryChange={handleCategoryChange} />

      <main id="catalog" className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">
            {activeCategory ? `Категория` : "Каталог"}
          </h2>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Показать все →
            </button>
          )}
        </div>

        <ProductGrid
          activeCategory={activeCategory}
          onAddToCart={handleAddToCart}
        />
      </main>

      <Footer />
    </div>
  );
}
