import type { APIRoute } from 'astro';
import * as schema from "@/schema";
import {deleteDxQuestion, getDxQuestionById, updateDxQuestion, type DxQuestion} from '@/services/dxQuestionService';
import {checkAdminPermissions, checkSession} from '@/services/authService';
import {getAttachmentsbyQuestionId} from '@/services/questionAttachmentService';
import {getSourcesByQuestionId} from '@/services/sourceService';
import {HttpError} from '@/errors/HttpError';
import {isUserInGroup} from '@/services/groupService';
import {errorHandler} from '@/errors/errorHandler';


export const DELETE: APIRoute = async ({ request, params }) => {
    const { dx_question_id } = params;

    try {
        if (!dx_question_id) {
            throw new HttpError(400, 'Bad request', 'Missing dx_question_id');
        }

        const question = await getDxQuestionById(dx_question_id);
        if (!question) {
            throw new HttpError(404, 'Not found', 'Question not found', { value: dx_question_id });
        }

        const session = await checkSession(request);

        if (!isUserInGroup(question.group_id, session.user.id)) {
            throw new HttpError(403, 'Forbidden', 'Only group members can delete questions');
        }

        const result = await deleteDxQuestion(dx_question_id);
        if (!result) {
            throw new HttpError(500, 'Internal server error', 'Failed to delete question');
        } 

        return new Response(JSON.stringify({
            success: true,
            message: 'Question deleted successfully',
            data: {
                id: dx_question_id,
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

export const PUT: APIRoute = async ({ request, params }) => {
    const { dx_question_id } = params;

    try {
        if (!dx_question_id) {
            throw new HttpError(400, 'Bad request', 'Missing dx_question_id');
        }

        const question = await getDxQuestionById(dx_question_id);
        if (!question) {
            throw new HttpError(404, 'Not found', 'Question not found', { value: dx_question_id });
        }

        const session = await checkSession(request);

        if (!isUserInGroup(question.group_id, session.user.id)) {
            throw new HttpError(403, 'Forbidden', 'Only group members can update questions');
        }

        const formData = await request.formData();
        const data: Partial<DxQuestion> = {};

        for (const [key, value] of formData.entries()) {
            if (!(key in schema.dxQuestion)) {
                throw new HttpError(400, 'Bad request', 'Invalid field', { value: key });
            }
            data[key as keyof DxQuestion] = value as any;
        }

        const result = await updateDxQuestion(dx_question_id, data);
        if (!result) {
            throw new HttpError(500, 'Internal server error', 'Failed to update question');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'DxQuestion updated successfully',
            data: {
                id: result.id
            }
        }), {
            status: 200, // htmx does not update the dom with 204 status
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
};

export const GET: APIRoute = async ({ request, params }) => {
    const { dx_question_id } = params;

    try {
        if (!dx_question_id) {
            throw new HttpError(400, 'Bad request', 'Missing dx_question_id');
        }

        const question = await getDxQuestionById(dx_question_id);
        if (!question) {
            throw new HttpError(404, 'Not found', 'Question not found', { value: dx_question_id });
        }

        const session = await checkSession(request);
        await checkAdminPermissions(question.class_id, session);

        const url = new URL(request.url);

        const sources = url.searchParams.get('include_sources') === 'true'
            ? await getSourcesByQuestionId(dx_question_id) : undefined;

        const attachments = url.searchParams.get('include_attachments') === 'true'
            ? await getAttachmentsbyQuestionId(dx_question_id) : undefined;

        return new Response(JSON.stringify({
            success: true,
            message: 'Question retrieved successfully',
            data: {
                question,
                sources,
                attachments,
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
}
