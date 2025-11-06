import { getServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function CartPage() {
  const supabase = await getServerSupabaseClient();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Faça <Link className="underline" href="/auth/login">login</Link> para ver seu carrinho.</p>
      </div>
    );
  }

  const { data: items } = await supabase
    .from('cart_items')
    .select('id, product_id, quantity')
    .eq('user_id', user.id);

  type CartItem = { id: string; product_id: string; quantity: number };
  const productIds = (items ?? []).map((i: CartItem) => i.product_id);

  let productsById: Record<string, any> = {};
  if (productIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('id,name,slug,price_cents,brand,categories(fallback_image)')
      .in('id', productIds);
    for (const p of data ?? []) productsById[p.id] = p;
  }

  type EnrichedCartItem = CartItem & { product?: any };
  const enriched: EnrichedCartItem[] = (items ?? []).map((i: CartItem) => ({
    ...i,
    product: productsById[i.product_id],
  }));

  const subtotal = enriched.reduce((acc: number, it: EnrichedCartItem) => acc + ((it.product?.price_cents ?? 0) * it.quantity), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Carrinho</h1>
      {enriched.length === 0 ? (
        <p className="text-sm text-zinc-500">Seu carrinho está vazio.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {enriched.map((it: EnrichedCartItem) => (
              <div key={it.id} className="flex items-center gap-4 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-3">
                <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-900 rounded overflow-hidden flex items-center justify-center">
                  {(it.product as any)?.categories?.fallback_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(it.product as any).categories.fallback_image} alt={it.product.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${it.product?.slug}`} className="font-medium hover:underline">
                    {it.product?.name}
                  </Link>
                  <div className="text-xs text-zinc-500">Qtd: {it.quantity}</div>
                </div>
                <div className="text-sm">{formatPrice((it.product?.price_cents ?? 0) * it.quantity)}</div>
              </div>
            ))}
          </div>
          <aside className="border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-4 h-fit">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <button className="mt-4 w-full px-4 py-2 rounded-md bg-zinc-900 text-white text-sm disabled:opacity-50" disabled>
              Finalizar (pagamento desabilitado)
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}


