import { getServerSupabaseClient } from "@/lib/supabase/server";
import CategoryFilters from "@/components/CategoryFilters";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

type Params = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Params) {
  const supabase = await getServerSupabaseClient();
  const { slug } = await params;

  const [{ data: categoriesRes }, { data: categories }] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug")
      .eq("slug", slug)
      .limit(1),
    supabase.from("categories").select("id,name,slug").order("name", { ascending: true }),
  ]);

  const category = categoriesRes?.[0];

  if (!category) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-zinc-500">Categoria não encontrada.</p>
      </div>
    );
  }

  const { data: products } = await supabase
    .from("products")
    .select("id,name,slug,price_cents,brand,categories(fallback_image)")
    .eq("category_id", category.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 text-sm text-zinc-500">
        <Link href="/">Início</Link> / <span>Categorias</span> / <span className="text-zinc-900 dark:text-zinc-200">{category.name}</span>
      </div>
      <div className="flex gap-8">
        <CategoryFilters categories={categories ?? []} />
        <section className="flex-1">
          <h1 className="text-2xl font-semibold mb-4">{category.name}</h1>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Nenhum produto nesta categoria ainda.</p>
          )}
        </section>
      </div>
    </div>
  );
}


