import { getSession } from "auth-astro/server";
import { defineMiddleware, sequence } from "astro:middleware";

const logging = defineMiddleware(async (context, next) => {
    const startTime = Date.now();
    const { pathname } = new URL(context.request.url);

    //console.log(`Request [${context.request.method}] ${pathname}`);

    const response = await next();

    const duration = Date.now() - startTime;
    console.log(`[${context.request.method}] - ${response.status} - ${pathname} - Duration: ${duration}ms`);

    return response;
});

const authorization = defineMiddleware(async (context, next) => {
    const { pathname } = new URL(context.request.url);

    // Excluir la página de login y las rutas de API de autenticación
    const publicPaths = ["/login", "/api/auth"];  // Agrega aquí todas las rutas que deben ser públicas

    // Si la ruta actual es una de las públicas, permite que pase sin verificación
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return next();
    }

    const session = await getSession(context.request);
    if (!session) {
        return context.redirect("/login");
    }

    //// index basado en rol
    if (pathname === "/" && session.user.role === "teacher") {
        return context.redirect("/dashboard");
    }

    return next();
});

export const onRequest = sequence(logging, authorization);
