import type { APIRoute } from 'astro';
import * as schema from "@/schema";
import {HttpError} from '@/errors/HttpError';
import {checkSession, checkTeacherRecorrido} from '@/services/authService';
import {deleteRecorrido, getTeacherRecorrido, updateRecorrido, type Recorrido} from '@/services/recorridoService';
import {errorHandler} from '@/errors/errorHandler';

export const PUT: APIRoute = async ({ request, params }) => {
    const { recorrido_id } = params;

    try {
        if (!recorrido_id) {
            throw new HttpError(400, 'Bad Request', 'recorrido_id is required');
        }

        const formData = await request.formData();
        const data: Partial<Recorrido> = {};

        for (const [key, value] of formData.entries()) {
            if (!(key in schema.recorrido)) {
                console.log(`Invalid parameter ${key}`);
                throw new HttpError(400, 'Bad Request', `Invalid parameter ${key}`);
            }
            data[key as keyof Recorrido] = value as any;
        }

        const session = await checkSession(request);
        await checkTeacherRecorrido(recorrido_id, session);

        const result = await updateRecorrido(recorrido_id, data);
        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Recorrido could not be updated');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Recorrido updated',
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

export const DELETE: APIRoute = async ({ request, params }) => {
    const { recorrido_id } = params;
    
    try {
        if (!recorrido_id) {
            throw new HttpError(400, 'Bad Request', 'recorrido_id is required');
        }

        const session = await checkSession(request);
        await checkTeacherRecorrido(recorrido_id, session);

        const result = await deleteRecorrido(recorrido_id);
        if (!result) {
            throw new HttpError(500, 'Internal Server Error', 'Recorrido could not be deleted');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Recorrido deleted',
            data: {
                id: result.id
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

export const GET: APIRoute = async ({ request, params }) => {
    const { recorrido_id } = params;

    try {
        if (!recorrido_id) {
            throw new HttpError(400, 'Bad Request', 'recorrido_id is required');
        }

        const session = await checkSession(request);

        const recorrido = session.user.role === 'teacher'
        ? await getTeacherRecorrido(recorrido_id, session.user.id)
        : null;//Por el momento no se implementa la busqueda de recorridos por parte de los estudiantes

        if (!recorrido) {
            throw new HttpError(404, 'Not Found', 'Recorrido not found');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Recorrido found',
            data: recorrido
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
}