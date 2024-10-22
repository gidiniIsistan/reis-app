import type { APIRoute } from 'astro';
import {HttpError} from '@/errors/HttpError';
import {getGroup, removeUserFromGroup} from '@/services/groupService';
import {checkSession} from '@/services/authService';
import {errorHandler} from '@/errors/errorHandler';

export const DELETE: APIRoute = async ({ request, params }) => {
    const { group_id, user_id } = params;

    try {
        if (!group_id || !user_id) {
            throw new HttpError(400, 'Bad Request', 'Group ID and User ID are required');
        }

        const {lider_id} = await getGroup(group_id);
        if (!lider_id) {
            throw new HttpError(404, 'Not Found', 'Group not found');
        }

        const session = await checkSession(request);
        if (lider_id !== session.user.id) {// && session.user.id !== user_id) {
            throw new HttpError(403, 'Forbidden', 'Only the group leader can remove users');
        }

        if (lider_id === user_id) {
            throw new HttpError(403, 'Forbidden', 'The group leader cannot be removed. Remove the group instead.');
        }

        const result = await removeUserFromGroup(group_id, user_id);

        if (!result) {
            throw new HttpError(404, 'Not Found', 'User not found in group');
        } 

        return new Response(JSON.stringify({
            success: true,
            message: 'User removed from group successfully',
            data: {
                group_id,
                user_id,
            }
        }), {
            status: 200, // htmx doesn't modify the dom with a 204 response
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
};
