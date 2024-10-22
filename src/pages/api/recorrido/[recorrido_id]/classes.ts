import type { APIRoute } from 'astro';
import {checkSession, checkTeacherRecorrido} from '@/services/authService';
import {getTeacherClasses, getUserClasses} from '@/services/classService';
import {HttpError} from '@/errors/HttpError';
import {errorHandler} from '@/errors/errorHandler';

export const GET: APIRoute = async ({ request, params }) => {
    const { recorrido_id } = params;

    try {
        if (!recorrido_id) {
            throw new HttpError(400, 'Bad Request', 'recorrido_id is required');
        }
        const session = await checkSession(request);
        const teacher = await checkTeacherRecorrido(recorrido_id, session);

        const result = teacher
            ? await getTeacherClasses(recorrido_id, session.user.id)
            : await getUserClasses(recorrido_id, session.user.id);

        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Classes could not be fetched');
        }
        return new Response(JSON.stringify({
            success: true,
            message: 'Classes fetched',
            data: result
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
};
