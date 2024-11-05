import { createUserSchema } from '@/lib/schemas/user';
import { supabase } from '@/lib/supabase';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const dto = await request.json();
  const { success, data } = createUserSchema.safeParse(dto);
  if (!success) {
    console.error(data);
    return new Response(JSON.stringify(data), {
      status: 400,
    });
  }

  try {
    const { error } = await supabase.from('users').insert(data);
    if (error) throw error;
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify(error), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({}), {
    status: 200,
  });
};
