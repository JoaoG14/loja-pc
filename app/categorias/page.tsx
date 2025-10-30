import { getServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CategoriasPage() {
  const supabase = getServerSupabaseClient();
  const { data: categories } = await supabase.from('categories').select('id,name,slug').order('name');
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Categorias</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(categories ?? []).map((c) => (
          <li key={c.id} className="rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 p-4">
            <Link className="hover:underline" href={`/categories/${c.slug}`}>{c.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}


