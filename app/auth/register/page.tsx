'use client';

import { getBrowserSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = getBrowserSupabaseClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    // Create profile row
    const userId = data.user?.id;
    if (userId) {
      await supabase.from('profiles').insert({ user_id: userId, full_name: name }).select().single();
    }
    setLoading(false);
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm">Nome</label>
          <input className="w-full rounded border px-3 py-2 bg-transparent" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input className="w-full rounded border px-3 py-2 bg-transparent" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Senha</label>
          <input className="w-full rounded border px-3 py-2 bg-transparent" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button disabled={loading} className="w-full px-4 py-2 rounded-md bg-zinc-900 text-white text-sm">
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      <p className="text-sm text-zinc-600 mt-3">
        Já tem conta? <Link href="/auth/login" className="underline">Entrar</Link>
      </p>
    </div>
  );
}


