import { getServerSupabaseClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function WishlistPage() {
  const supabase = await getServerSupabaseClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Faça <Link className="underline" href="/auth/login">login</Link> para ver sua lista de desejos.</p>
      </div>
    );
  }

  const { data: wishlist } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id);

  type WishlistItem = { product_id: string };
  const productIds = (wishlist ?? []).map((w: WishlistItem) => w.product_id);

  let products: any[] = [];
  if (productIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('id,name,slug,price_cents,brand,categories(fallback_image)')
      .in('id', productIds);
    products = data ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Favoritos</h1>
      {products.length === 0 ? (
        <p className="text-sm text-zinc-500">Você ainda não favoritou nenhum produto.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      )}
    </div>
  );
}


