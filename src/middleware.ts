import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user;

  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error(error);
    }
    context.locals.userInfo = data;

    const authPages = ['/login', '/registration'];
    if (authPages.includes(context.url.pathname)) {
      return context.redirect('/');
    }
  }

  const publicPaths = ['/login', '/registration', '/_image'];
  const authApiPath = /^\/api\/auth\/.*/;

  if (
    !user &&
    !publicPaths.includes(context.url.pathname) &&
    !authApiPath.test(context.url.pathname)
  ) {
    return context.redirect('/login');
  }

  return next();
});
