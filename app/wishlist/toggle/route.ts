import { NextResponse } from 'next/server';
import { getRouteSupabaseClient } from '@/lib/supabase/route';

export async function POST(request: Request) {
  const supabase = await getRouteSupabaseClient();
  const form = await request.formData();
  const productId = String(form.get('product_id') || '');
  const redirectTo = String(form.get('redirect_to') || '/wishlist');

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL || "https://loja-pc-iota.vercel.app/" || 'http://localhost:3000'));
  }

  if (!productId) {
    return NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_BASE_URL || "https://loja-pc-iota.vercel.app/" || 'http://localhost:3000'));
  }

  const { data: existing } = await supabase
    .from('wishlists')
    .select('user_id,product_id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
  } else {
    await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
  }

  return NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_BASE_URL || "https://loja-pc-iota.vercel.app/" || 'http://localhost:3000'));
}


