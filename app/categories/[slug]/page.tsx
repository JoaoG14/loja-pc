import { getServerSupabaseClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

type Params = { params: { slug: string } };

export default async function CategoryPage({ params }: Params) {
  const supabase = getServerSupabaseClient();
  const slug = params.slug;

  const { data: categoriesRes } = await supabase
    .from("categories")
    .select("id,name,slug")
    .eq("slug", slug)
    .limit(1);

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
    .select("id,name,slug,price_cents,brand,product_images(url,is_primary)")
    .eq("category_id", category.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 text-sm text-zinc-500">
        <Link href="/">Início</Link> / <span>Categorias</span> / <span className="text-zinc-900 dark:text-zinc-200">{category.name}</span>
      </div>
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
    </div>
  );
}


