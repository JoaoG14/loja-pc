import { NextResponse } from 'next/server';
import { getRouteSupabaseClient } from '@/lib/supabase/route';

export async function POST() {
  const supabase = await getRouteSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || "https://loja-p2wj7zbfe-joaog14s-projects.vercel.app/" || 'http://localhost:3000'));
}


