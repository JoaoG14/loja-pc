import { NextResponse } from 'next/server';
import { getRouteSupabaseClient } from '@/lib/supabase/route';

export async function POST(request: Request) {
  const supabase = await getRouteSupabaseClient();
  const form = await request.formData();
  const productId = String(form.get('product_id') || '');
  const redirectTo = String(form.get('redirect_to') || '/cart');

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_BASE_URL || "https://loja-p2wj7zbfe-joaog14s-projects.vercel.app/" || 'http://localhost:3000'));
  }

  if (!productId) {
    return NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_BASE_URL || "https://loja-p2wj7zbfe-joaog14s-projects.vercel.app/" || 'http://localhost:3000'));
  }

  // Upsert item with quantity +1 if exists
  await supabase
    .from('cart_items')
    .upsert({ user_id: user.id, product_id: productId, quantity: 1 }, { onConflict: 'user_id,product_id' })
    .select();

  return NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_BASE_URL || "https://loja-p2wj7zbfe-joaog14s-projects.vercel.app/" || 'http://localhost:3000'));
}


