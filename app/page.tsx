import { getServerSupabaseClient } from "@/lib/supabase/server";
import CategoryFilters from "@/components/CategoryFilters";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const supabase = await getServerSupabaseClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id,name,slug").order("name", { ascending: true }),
    supabase
      .from("products")
      .select("id,name,slug,price_cents,brand,categories(fallback_image)")
      .limit(12),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex gap-8">
        <CategoryFilters categories={categories ?? []} />
        <section className="flex-1">
          <h1 className="text-2xl font-semibold mb-4">Destaques</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(products ?? []).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
