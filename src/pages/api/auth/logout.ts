import { supabase } from '@/lib/supabase';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ url, redirect }) => {
  const errorRedirect = (err: unknown) => {
    const error = err as Error;
    const searchParams = new URLSearchParams();
    searchParams.append('cause', 'error');
    searchParams.append('error', error.message);
    return redirect(`${url.origin}?${searchParams.toString()}`);
  };

  const { error } = await supabase.auth.signOut();
  if (error) {
    return errorRedirect(error);
  }
  return redirect(url.origin);
};
