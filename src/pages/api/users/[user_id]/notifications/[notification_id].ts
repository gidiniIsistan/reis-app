import type { APIRoute } from 'astro';
import {checkSession} from '@/services/authService';
import {HttpError} from '@/errors/HttpError';
import {errorHandler} from '@/errors/errorHandler';
import {getNotificationById, markNotificationAsRead} from '@/services/notificationService';

//mark as read
export const PUT: APIRoute = async ({ request, params }) => {
    const { user_id, notification_id } = params;

    try {
        if (!user_id || !notification_id) {
            throw new HttpError(400, 'Bad Request', 'user_id and notification_id are required');
        }

        const session = await checkSession(request);
        if (session.user.id !== user_id) {
            throw new HttpError(403, 'Forbidden', 'You are not allowed to mark notifications as read for another user');
        }

        const notification = await getNotificationById(notification_id);
        if (!notification) {
            throw new HttpError(404, 'Not Found', 'Notification not found');
        }
        if (notification.user_id !== user_id) {
            throw new HttpError(403, 'Forbidden', 'You are not allowed to mark notifications as read for another user');
        }

        const result = await markNotificationAsRead(notification_id);
        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Server error');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Notification marked as read successfully',
            data: {
                id: notification.id
            }
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
