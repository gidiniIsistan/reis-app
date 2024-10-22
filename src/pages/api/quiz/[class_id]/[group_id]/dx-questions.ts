import type { APIRoute } from 'astro';
import {checkAdminPermissions, checkSession} from '@/services/authService';
import {getDxQuestions} from '@/services/dxQuestionService';
import { HttpError } from '@/errors/HttpError';
import { errorHandler } from '@/errors/errorHandler';

export const GET: APIRoute = async ({ request, params }) => {
    const { class_id, group_id } = params;

    try {
        if (!class_id || !group_id) {
            throw new HttpError(400, 'Bad Request', 'Invalid class_id or group_id provided');
        }

        const session = await checkSession(request);
        const teacher = await checkAdminPermissions(class_id, session);

        const result = await getDxQuestions(class_id, group_id, teacher ? undefined : session.user.id);
        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'An unexpected error occurred');
        }
        return new Response(JSON.stringify({
            success: true,
            message: 'Questions fetched successfully',
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
