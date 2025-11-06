import { getServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

type Params = { params: Promise<{ slug: string }> };

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default async function ProductPage({ params }: Params) {
  const supabase = await getServerSupabaseClient();
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select(
      "id,name,slug,description,price_cents,brand,model,stock,socket,chipset,tdp_watts,memory_type,wattage,form_factor,warranty_months,categories(fallback_image),product_specs(spec_key,spec_value)"
    )
    .eq("slug", slug)
    .single();

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-zinc-500">Produto não encontrado.</p>
      </div>
    );
  }

  const imageUrl = (product.categories as any)?.fallback_image;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 text-sm text-zinc-500">
        <Link href="/">Início</Link> / <Link href={`/categories`}>Categorias</Link> / <span className="text-zinc-900 dark:text-zinc-200">{product.name}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-4/3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-md overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="text-xs text-zinc-500">Sem imagem</div>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <div className="text-sm text-zinc-500 mt-1">{product.brand} {product.model}</div>
          <div className="mt-3 text-2xl text-emerald-600 dark:text-emerald-400">{formatPrice(product.price_cents)}</div>
          <div className="mt-2 text-sm text-zinc-500">Estoque: {product.stock ?? 0}</div>
          <p className="mt-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300 whitespace-pre-line">{product.description}</p>

          {/* Placeholder buttons (wire up in client components later) */}
          <div className="mt-6 flex gap-3">
            <form action="/cart/add" method="post">
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="redirect_to" value={`/products/${product.slug}`} />
              <button className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm">Adicionar ao carrinho</button>
            </form>
            <form action="/wishlist/toggle" method="post">
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="redirect_to" value={`/products/${product.slug}`} />
              <button className="px-4 py-2 rounded-md border text-sm">Favoritar</button>
            </form>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold mb-3">Especificações técnicas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {product.socket && (
                <div className="flex justify-between"><span className="text-zinc-500">Socket</span><span>{product.socket}</span></div>
              )}
              {product.chipset && (
                <div className="flex justify-between"><span className="text-zinc-500">Chipset</span><span>{product.chipset}</span></div>
              )}
              {typeof product.tdp_watts === 'number' && (
                <div className="flex justify-between"><span className="text-zinc-500">TDP</span><span>{product.tdp_watts} W</span></div>
              )}
              {product.memory_type && (
                <div className="flex justify-between"><span className="text-zinc-500">Memória</span><span>{product.memory_type}</span></div>
              )}
              {typeof product.wattage === 'number' && (
                <div className="flex justify-between"><span className="text-zinc-500">Potência</span><span>{product.wattage} W</span></div>
              )}
              {product.form_factor && (
                <div className="flex justify-between"><span className="text-zinc-500">Formato</span><span>{product.form_factor}</span></div>
              )}
              {typeof product.warranty_months === 'number' && (
                <div className="flex justify-between"><span className="text-zinc-500">Garantia</span><span>{product.warranty_months} meses</span></div>
              )}
            </div>

            {product.product_specs && product.product_specs.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Mais detalhes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {product.product_specs.map((s: any) => (
                    <div key={s.spec_key} className="flex justify-between">
                      <span className="text-zinc-500">{s.spec_key}</span>
                      <span>{s.spec_value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


