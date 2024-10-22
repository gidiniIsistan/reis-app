import type { APIRoute } from 'astro';
import * as schema from "@/schema";
import {checkAdminPermissions, checkSession} from '@/services/authService';
import {deleteClass, getClassById, updateClass, type ClassType} from '@/services/classService';
import { HttpError } from '@/errors/HttpError';
import { errorHandler } from '@/errors/errorHandler';

export const PUT: APIRoute = async ({ request, params }) => {
    const { class_id } = params;

    try {
        if (!class_id) {
            throw new HttpError(400, 'Bad Request', 'Missing class id');
        }

        const formData = await request.formData();
        const data: Partial<ClassType> = {};

        for (const [key, value] of formData.entries()) {
            if (!(key in schema.classTable)) {
                console.log(`Invalid parameter ${key}`);
                throw new HttpError(400, 'Bad Request', `Invalid parameter ${key}`);
            }
            data[key as keyof ClassType] = value as any;
        }

        const session = await checkSession(request);
        await checkAdminPermissions(class_id, session);

        const result = await updateClass(class_id, data);

        if (!result) {
            throw new HttpError(500, 'Internal server error', 'Failed to update class');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Class updated successfully',
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
        console.log(error);
        return errorHandler(error);
    }
};


export const DELETE: APIRoute = async ({ request, params }) => {
    const { class_id } = params;
    
    try {
        if (!class_id) {
            throw new HttpError(400, 'Bad Request', 'Missing class id');
        }

        const session = await checkSession(request);
        await checkAdminPermissions(class_id, session);

        const result = await deleteClass(class_id);

        if (!result) {
            throw new HttpError(500, 'Internal server error', 'Failed to delete class');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Class deleted successfully',
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
    const { class_id } = params;

    try {
        if (!class_id) {
            throw new HttpError(400, 'Bad Request', 'Missing class id');
        }

        const session = await checkSession(request);
        const teacher = await checkAdminPermissions(class_id, session);
        if (!teacher) {
            throw new HttpError(403, 'Forbidden', 'You do not have permission to view this class');
        }
        
        const result = await getClassById(class_id);
        if (!result) {
            throw new HttpError(404, 'Not Found', 'Class not found');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Class retrieved successfully',
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
