import type { APIRoute } from 'astro';
import {checkSession} from '@/services/authService';
import {HttpError} from '@/errors/HttpError';
import {errorHandler} from '@/errors/errorHandler';
import {createNotification, getUserNotifications, markAllNotificationsAsRead} from '@/services/notificationService';

export const GET: APIRoute = async ({ request, params }) => {
    const { user_id } = params;

    try {
        if (!user_id) {
            throw new HttpError(400, 'Bad Request', 'user_id is required');
        }

        const session = await checkSession(request);
        if (session.user.id !== user_id) {
            throw new HttpError(403, 'Forbidden', 'You are not allowed to view notifications for another user');
        }

        const notifications = await getUserNotifications(user_id);
        return new Response(JSON.stringify({
            success: true,
            message: 'Notifications retrieved successfully',
            data: {
                notifications
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

export const POST: APIRoute = async ({ request, params }) => {
    const { user_id } = params;

    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const message = formData.get('message') as string;

        if (!user_id || !title || !message) {
            throw new HttpError(400, 'Bad Request', 'user_id, title, and message are required');
        }

        await checkSession(request); //TODO: validate who can create notifications(maybe in middleware)

        const notification = await createNotification(user_id, title, message);

        return new Response(JSON.stringify({
            success: true,
            message: 'Notification created successfully',
            data: {
                id: notification.id
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

//mark-all-as-read

export const PUT: APIRoute = async ({ request, params }) => {
    const { user_id } = params;

    try {
        const formData = await request.formData();
        const isRead = formData.get('is_read') === 'true';

        if (!user_id || isRead === undefined) {
            throw new HttpError(400, 'Bad Request', 'user_id and is_read are required');
        }

        if (isRead !== true) {
            throw new HttpError(400, 'Bad Request', 'This endpoint only supports marking all notifications as read (is_read=true)');
        }

        const session = await checkSession(request);

        if (session.user.id !== user_id) {
            throw new HttpError(403, 'Forbidden', 'You are not allowed to mark notifications as read for another user');
        }

        const result = await markAllNotificationsAsRead(user_id);
        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Server error');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'All notifications marked as read successfully'
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
