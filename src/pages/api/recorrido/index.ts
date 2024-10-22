import type { APIRoute } from 'astro';
import {checkSession} from '@/services/authService';
import {HttpError} from '@/errors/HttpError';
import {insertRecorrido} from '@/services/recorridoService';
import {errorHandler} from '@/errors/errorHandler';

export const POST: APIRoute = async ({ request }) => {
    try {
        const session = await checkSession(request);
        if (session.user.role !== 'teacher') {
            throw new HttpError(403, 'Forbidden', 'Only teachers can create recorridos');
        }

        const result = await insertRecorrido(session.user.id);
        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Failed to create recorrido');
        }
        return new Response(JSON.stringify({
            success: true,
            message: 'Recorrido created',
            data: {
                id: result.id
            }
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
};
