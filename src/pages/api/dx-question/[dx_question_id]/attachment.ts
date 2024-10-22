import type { APIRoute } from 'astro';
import { db } from "@/../db";
import * as schema from "@/schema";
import { eq } from 'drizzle-orm';
import { deleteFile } from '@/services/fileService';
import {checkSession} from '@/services/authService';
import {getDxQuestionById} from '@/services/dxQuestionService';
import {getAttachmentsbyQuestionId, saveQuestionAttachment} from '@/services/questionAttachmentService';
import {HttpError} from '@/errors/HttpError';
import {errorHandler} from '@/errors/errorHandler';

export const POST: APIRoute = async ({ request, params }) => {
    const { dx_question_id } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    try {
        if (!dx_question_id || !file) {
            throw new HttpError(400, 'Bad request', 'Missing dx_question_id or file');
        }

        const session = await checkSession(request);
        const question = await getDxQuestionById(dx_question_id, session.user.id);
        if (!question) {
            throw new HttpError(404, 'Not found', 'Question not found', { value: dx_question_id });
        }

        saveQuestionAttachment(dx_question_id, file);

        return new Response(JSON.stringify({
            success: true,
            message: 'Attachment uploaded successfully',
            data: {
                id: dx_question_id,
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


export const DELETE: APIRoute = async ({ request, params }) => {
    const { dx_question_id } = params;

    try {
        if (!dx_question_id ) {
            throw new HttpError(400, 'Bad request', 'Missing dx_question_id');
        }

        const session = await checkSession(request);
        const attachments = await getAttachmentsbyQuestionId(dx_question_id, session.user.id);
        console.log(attachments);
        if (!attachments || attachments.length === 0) {
            throw new HttpError(404, 'Not found', 'No attachments to delete', { value: dx_question_id });
        }

        //WARNING: por ahora solo se permite un archivo por pregunta
        attachments.forEach(async (att) => {
            await db.delete(schema.attachment).where(eq(schema.attachment.id, att.id));
        });

        // Eliminar el archivo del sistema de archivos
        //NOTE: por ahora solo se permite un archivo por pregunta
        attachments.forEach(async (att) => {
            await deleteFile(att.filePath);
        });
        return new Response(JSON.stringify({
            success: true,
            message: 'Attachment deleted successfully',
            data: {
                id: dx_question_id,
            }
        }) , {
            status: 204,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return errorHandler(error);
    }
};
