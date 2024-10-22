import type { APIRoute } from 'astro';
import { db } from "@/../db";
import * as schema from "@/schema";
import { eq } from 'drizzle-orm';
import { deleteFile } from '@/services/fileService';
import {checkSession} from '@/services/authService';
import {getQuiz, getQuizWithAttachments} from '@/services/quizService';
import {saveQuizAttachment} from '@/services/quizAttachmentService';
import { HttpError } from '@/errors/HttpError';
import { errorHandler } from '@/errors/errorHandler';

export const POST: APIRoute = async ({ request, params }) => {
    const { class_id, group_id } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    try {
        if (!class_id || !group_id || !file) {
            throw new HttpError(400, 'Bad Request', 'Missing required parameters');
        }

        const session = await checkSession(request);
        const quiz = await getQuiz(class_id, group_id, session.user.id);

        if (!quiz) {
            throw new HttpError(404, 'Not Found', 'Quiz not found');
        }

        saveQuizAttachment(class_id, group_id, file);

        return new Response(JSON.stringify({
            success: true,
            message: 'Attachment uploaded successfully',
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
    try {
        const { class_id, group_id } = params;
        if (!class_id || !group_id ) {
            throw new HttpError(400, 'Bad Request', 'Missing required parameters');
        }

        const session = await checkSession(request);

        const quiz = await getQuizWithAttachments(class_id, group_id, session.user.id);

        if (!quiz) {
            throw new HttpError(404, 'Not Found', 'Quiz not found');
        } else if (!quiz.attachments || quiz.attachments.length === 0) {
            throw new HttpError(404, 'Not Found', 'No attachments found');
        }

        //WARNING: por ahora solo se permite un archivo por quiz
        quiz.attachments.forEach(async (att) => {
            await db.delete(schema.attachment).where(eq(schema.attachment.id, att.id));
        });

        // Eliminar el archivo del sistema de archivos
        //NOTE: por ahora solo se permite un archivo por quiz
        //await deleteFile(quiz.attachments[0].file_path);
        quiz.attachments.forEach(async (att) => {
            await deleteFile(att.filePath);
        });
        return new Response(JSON.stringify({
            success: true,
            message: 'Attachment deleted successfully',
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
