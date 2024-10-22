import type { APIRoute } from 'astro';
import * as schema from "@/schema";
import {checkAdminPermissions, checkSession} from '@/services/authService';
import {getQuiz, getQuizWithAttachments, updateQuiz, type Quiz} from '@/services/quizService';
import {getGroupUsers, isUserInGroup} from '@/services/groupService';
import {HttpError} from '@/errors/HttpError';
import {errorHandler} from '@/errors/errorHandler';


export const PUT: APIRoute = async ({ request, params }) => {
    const { class_id, group_id } = params;
    
    try {
        if (!class_id || !group_id) {
            throw new HttpError(400, 'Bad Request', 'Missing required parameters');
        }

        const session = await checkSession(request);
        if (await !isUserInGroup(group_id, session.user.id)) {
            throw new HttpError(403, 'Forbidden', 'User is not a member of this group', { context: { user_id: session.user.id, group_id, function: 'isUserInGroup' } });
        }

        const formData = await request.formData();
        const data: Record<string, Partial<Quiz>> = {};

        for (const [key, value] of formData.entries()) {
            if (!(key in schema.quiz) || data[key] !== undefined) {
                throw new HttpError(400, 'Bad Request', `Invalid parameter ${key}`);
            }
            data[key as keyof Quiz] = value as any;
        }

        const result = await updateQuiz(class_id, group_id, data);
        if (!result) {
            throw new HttpError(404, 'Not Found', 'Quiz not found');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Quiz updated successfully',
            data: {
                result
            },
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


export const GET: APIRoute = async ({ request, params }) => {
    const { class_id, group_id } = params;

    try {
        if (!class_id || !group_id) {
            throw new HttpError(400, 'Bad Request', 'Missing required parameters');
        }

        const session = await checkSession(request);
        const isAdmin = await checkAdminPermissions(class_id, session);

        const url = new URL(request.url);

        const quiz = url.searchParams.get('include_attachments') === 'true'
            ? await getQuizWithAttachments(class_id, group_id, isAdmin ? undefined : session.user.id) 
            : await getQuiz(class_id, group_id, isAdmin ? undefined : session.user.id);

        const users = url.searchParams.get('include_users') === 'true'
            ? await getGroupUsers(group_id)
            : [];

        if (!quiz || !quiz.class_id ) {
            throw new HttpError(404, 'Not Found', 'Quiz not found');
        }

        return new Response(JSON.stringify({
            success: true,
            data: {
                quiz,
                users
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
