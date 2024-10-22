import type { APIRoute } from 'astro';
import {HttpError} from '@/errors/HttpError';
import {checkSession} from '@/services/authService';
import {deleteNewQuestion, getNewQuestion, updateNewQuestion} from '@/services/newQuestionService';
import {errorHandler} from '@/errors/errorHandler';


export const DELETE: APIRoute = async ({ request, params }) => {
    const { id } = params;

    try {
        if (!id) {
            throw new HttpError(400, 'Bad Request', 'Missing question id');
        }

        const session = await checkSession(request);

        const question = await getNewQuestion(id, session.user.id);
        if (!question) {
            throw new HttpError(404, 'Not Found', 'New Question not found');
        }

        const result = await deleteNewQuestion(id);
        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Failed to delete question');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Question deleted successfully',
            data: {
                id: result.id
            }
        }), {
            status: 200, // htmx doesn't handle 204 well
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
};

export const PUT: APIRoute = async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();
    const text = formData.get('question') as string;
    
    try {
        if (!id || !text) {
            throw new HttpError(400, 'Bad Request', 'Missing question id or question text');
        }

        const session = await checkSession(request);

        const question = await getNewQuestion(id, session.user.id);
        if (!question) {
            throw new HttpError(404, 'Not Found', 'New Question not found');
        }

        const result = await updateNewQuestion(id, text);

        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Failed to update question');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Question updated successfully',
            data: {
                id: result.id
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
