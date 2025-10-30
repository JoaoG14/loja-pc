import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  brand: string | null;
  product_images?: { url: string; is_primary: boolean }[];
};

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProductCard({ product }: { product: Product }) {
  const image = product.product_images?.find((i) => i.is_primary) || product.product_images?.[0];
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 p-3 hover:shadow-sm transition-shadow"
    >
      <div className="aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-900 rounded-md overflow-hidden mb-3 flex items-center justify-center">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="text-xs text-zinc-500">Sem imagem</div>
        )}
      </div>
      <div className="text-xs text-zinc-500">{product.brand ?? '—'}</div>
      <div className="font-medium line-clamp-2">{product.name}</div>
      <div className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">{formatPrice(product.price_cents)}</div>
    </Link>
  );
}


