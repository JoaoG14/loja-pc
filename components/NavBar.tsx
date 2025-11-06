import Link from 'next/link';
import { getServerSupabaseClient } from '@/lib/supabase/server';

export default async function NavBar() {
  const supabase = await getServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  return (
    <header className="border-b border-zinc-200/60">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">
          TechParts Store
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">Início</Link>
          <Link href="/categorias" className="hover:underline">Categorias</Link>
          <Link href="/wishlist" className="hover:underline">Favoritos</Link>
          <Link href="/cart" className="hover:underline">Carrinho</Link>
          {user ? (
            <form action="/auth/logout" method="post">
              <button className="hover:underline" type="submit">Sair</button>
            </form>
          ) : (
            <Link href="/auth/login" className="hover:underline">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}


