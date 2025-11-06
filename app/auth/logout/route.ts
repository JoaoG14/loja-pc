import { NextResponse } from 'next/server';
import { getRouteSupabaseClient } from '@/lib/supabase/route';

export async function POST() {
  const supabase = await getRouteSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', "https://loja-pc-iota.vercel.app"));
}


