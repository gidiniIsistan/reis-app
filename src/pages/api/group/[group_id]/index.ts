import type { APIRoute } from 'astro';
import {HttpError} from '@/errors/HttpError';
import {checkSession} from '@/services/authService';
import {softDeleteGroup} from '@/services/groupService';
import {errorHandler} from '@/errors/errorHandler';

export const DELETE: APIRoute = async ({ request, params }) => {
    const { group_id } = params;

    try {
        if (!group_id) {
            throw new HttpError(400, 'Bad Request', 'Group ID is required');
        }

        const session = await checkSession(request);

        const result = await softDeleteGroup(group_id, session.user.id);
        if (!result) {
            throw new HttpError(404, 'Not Found', 'Group not found');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Group deleted successfully',
            data: {
                group_id,
            }
        }), {
            status: 204,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
};
