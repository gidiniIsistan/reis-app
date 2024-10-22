import type { APIRoute } from 'astro';
import * as schema from "@/schema";
import {updateSource, type Source} from '@/services/sourceService';
import {HttpError} from '@/errors/HttpError';
import {checkSession} from '@/services/authService';
import {getDxQuestionById} from '@/services/dxQuestionService';
import {errorHandler} from '@/errors/errorHandler';


export const PUT: APIRoute = async ({ request, params }) => {
    const { dx_question_id } = params;

    try {
        if (!dx_question_id) {
            throw new HttpError(400, 'Bad request', 'Missing dx_question_id');
        }
    
        const session = await checkSession(request);
        const question = await getDxQuestionById(dx_question_id, session.user.id);
        if (!question) {
            throw new HttpError(404, 'Not found', 'Question not found', { value: dx_question_id });
        }

        const formData = await request.formData();
        let data: Record<string, Partial<Source>> = {};

        for (const [key, value] of formData.entries()) {
            // the synyax is <id>.<field>
            const parts = key.split('.');
            const id = parts[0] as string;
            const field = parts[1] as string;

            if (!id) {
                throw new HttpError(400, 'Bad request', 'Invalid source_id', { value: id });
            }
            if (!field || !(field in schema.source)) {
                //return new Response(`Invalid field ${field} for source_id ${id}`, { status: 400 });
                throw new HttpError(400, 'Bad request', `Invalid field for source_id ${id}`, { value: field });
            }
            if (field === 'rating' && isNaN(Number(value))) {
                //return new Response(`Invalid rating for source_id ${id}`, { status: 400 });
                throw new HttpError(400, 'Bad request', `Invalid rating for source_id ${id}`, { value: value as string });
            }
            if (!data[id]) {
                data[id] = {} as Source;
            }
            data[id][field as keyof Source] = value as any;
        };

        for (const key in data) {
            const result = await updateSource(key, data[key]);
            
            //TODO: for those that are not found, don't return an error, just warn about it
            if (!result) {
                throw new HttpError(500, 'Internal server error', `Failed to update source ${key}`);
            }
        };
        return new Response(JSON.stringify({
            success: true,
            data: {
                id: dx_question_id
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
