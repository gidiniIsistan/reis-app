import type { APIRoute } from 'astro';
import * as schema from "@/schema";
import {HttpError} from '@/errors/HttpError';
import {checkSession} from '@/services/authService';
import {deleteSource, getSourceById, updateSource, type Source} from '@/services/sourceService';
import {errorHandler} from '@/errors/errorHandler';

export const DELETE: APIRoute = async ({ request, params }) => {
    const { source_id } = params;

    try {
        if (!source_id) {
           throw new HttpError(400, 'Bad Request', 'source_id is required');
        }

        const session = await checkSession(request);

        const src = await getSourceById(source_id, session.user.id);
        if (!src) {
            throw new HttpError(404, 'Not Found', 'Source not found');
        }

        const result = await deleteSource(source_id);
        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Server error');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Source deleted successfully',
            data: {
                id: result.id
            }
        }), {
            status: 200, // if htmx receives a 204, doesn't update the DOM
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
};

export const PUT: APIRoute = async ({ request, params }) => {
    const { source_id } = params;

    try {
        if (!source_id) {
            throw new HttpError(400, 'Bad Request', 'source_id is required');
        }

        const formData = await request.formData();
        const data: Partial<Source> = {};

        for (const [key, value] of formData.entries()) {
            if (!(key in schema.source)) {
                throw new HttpError(400, 'Bad Request', `Invalid field: ${key}`);
            }
            data[key as keyof Source] = value as any;
        }

        const session = await checkSession(request);

        const src = await getSourceById(source_id, session.user.id);
        if (!src) {
            return new Response('Source not found', { status: 404 });
        }

        const result = await updateSource(source_id, data);

        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Server error');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Source updated successfully',
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
