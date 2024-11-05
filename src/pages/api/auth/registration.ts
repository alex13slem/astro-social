import { registrationSchema } from '@/lib/schemas/auth';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, url, redirect }) => {
  const errorRedirect = (err: unknown) => {
    console.error(err);

    const error = err as Error;
    const searchParams = new URLSearchParams();
    searchParams.append('cause', 'error');
    searchParams.append('error', error.message);
    return redirect(`${url.origin}/registration?${searchParams.toString()}`);
  };

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Проверяем входные данные
  const result = registrationSchema.safeParse(data);
  if (!result.success) {
    console.error(result.error);
    return errorRedirect(encodeURIComponent('Ошибка при регистрации'));
  }

  const { email, password, username } = result.data;

  // Проверяем, авторизован ли пользователь
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return redirect(url.origin + '/profile'); // Если пользователь уже авторизован
    }
  } catch (error) {
    return errorRedirect(error);
  }

  // Регистрация пользователя
  let newUser: User;
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error || !user) throw error;

    newUser = user;
  } catch (error) {
    return errorRedirect(error);
  }

  // Создание профиля пользователя в базе данных
  try {
    const request = await fetch(url.origin + '/api/user/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: newUser.id,
        full_name: username,
        email,
      }),
    });

    const response = await request.json();
    if (response.error) throw response.error;
  } catch (error) {
    return errorRedirect(error);
  }

  // После успешной регистрации и создания профиля — логин и редирект
  try {
    const {
      data: { session },
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !session) throw loginError;

    return redirect(url.origin + '/profile'); // Редирект на страницу профиля после авторизации
  } catch (error) {
    return errorRedirect(error);
  }
};
