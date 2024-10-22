import type { APIRoute } from 'astro';
import {checkSession, checkTeacherRecorrido} from '@/services/authService';
import {createClass} from '@/services/classService';
import { HttpError } from '@/errors/HttpError';
import { errorHandler } from '@/errors/errorHandler';

export const POST: APIRoute = async ({ request }) => {
    const body = await request.formData();
    const recorrido_id = body.get('recorrido_id') as string;
    const title = body.get('title') as string;
    const desc = body.get('desc') as string | null;
    const start_date = body.get('start_date') as string;
    const end_date = body.get('end_date') as string | null;

    try {
        if (!recorrido_id || !title || !start_date) {
            throw new HttpError(400, 'Bad Request', 'Missing required fields');
        };

        const session = await checkSession(request);
        const teacher = await checkTeacherRecorrido(recorrido_id, session);

        if (!teacher) {
            throw new HttpError(403, 'Forbidden', 'You are not allowed to create classes in this recorrido');
        }

        const result = await createClass(recorrido_id, title, desc, start_date, end_date);

        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'An unexpected error occurred while creating the class');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Class created successfully',
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
