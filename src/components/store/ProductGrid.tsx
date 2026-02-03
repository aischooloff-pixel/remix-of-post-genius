import { Product, Category, products, categories } from "@/data/products";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  activeCategory: Category | null;
  onAddToCart?: (product: Product) => void;
}

export function ProductGrid({ activeCategory, onAddToCart }: ProductGridProps) {
  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  // Group products by category when showing all
  const groupedProducts = activeCategory
    ? null
    : Object.keys(categories).reduce((acc, cat) => {
        const categoryProducts = products.filter((p) => p.category === cat);
        if (categoryProducts.length > 0) {
          acc[cat as Category] = categoryProducts;
        }
        return acc;
      }, {} as Record<Category, Product[]>);

  if (activeCategory) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {groupedProducts &&
        Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <section key={category}>
            <h2 className="text-2xl font-bold mb-6">
              {categories[category as Category].name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
