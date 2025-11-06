import Link from 'next/link';

type Category = { id: string; name: string; slug: string };

export default function CategoryFilters({ categories }: { categories: Category[] }) {
  return (
    <aside className="w-full sm:w-60 shrink-0">
      <div className="sticky top-4 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 p-4">
        <h3 className="text-sm font-semibold mb-3">Categorias</h3>
        <ul className="space-y-2 text-sm">
          {categories.map((c: Category) => (
            <li key={c.id}>
              <Link className="text-zinc-700 dark:text-zinc-300 hover:underline" href={`/categories/${c.slug}`}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}


