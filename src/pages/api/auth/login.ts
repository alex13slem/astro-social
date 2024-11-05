import { loginSchema } from '@/lib/schemas/auth';
import { supabase } from '@/lib/supabase';
import { AuthError } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, url, redirect }) => {
  const errorRedirect = (err: unknown, cause: string) => {
    const error = err as Error;
    const searchParams = new URLSearchParams();
    searchParams.append('cause', cause);
    searchParams.append('error', error.message);
    return redirect(`${url.origin}/login?${searchParams.toString()}`);
  };

  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return errorRedirect(
      encodeURIComponent('Ошибка при входе'),
      'validate-error',
    );
  }
  const { email, password } = result.data;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return redirect(url.origin + '/profile');
  } catch (error) {
    if (error instanceof AuthError) {
      return errorRedirect(error, 'auth-error');
    }
    return errorRedirect(error, 'unknown-error');
  }
};
