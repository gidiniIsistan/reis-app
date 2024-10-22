import type { APIRoute } from 'astro';
import {checkSession} from '@/services/authService';
import {checkResource} from '@/services/fileService';
import {getQuizAttachment} from '@/services/quizAttachmentService'
import path from 'path';
import { promises as fs } from 'fs';
import {getQuestionAttachment} from '@/services/questionAttachmentService';
import {HttpError} from '@/errors/HttpError';
import {errorHandler} from '@/errors/errorHandler';


export const GET: APIRoute = async ({ request, params }) => {
    const { resource } = params;

    try {
        if (!resource) {
            throw new HttpError(400, 'Bad Request', 'Resource is required');
        }

        const session = await checkSession(request);
        const admin = session.user.role === 'admin';
        const [resource_type, resource_id] = checkResource(resource);
        const file_path = path.join(import.meta.env.UPLOADS_DIR, resource);

        const attachment = resource_type === 'quiz'
            ? await getQuizAttachment(file_path, admin ? undefined : session.user.id)
            : await getQuestionAttachment(file_path, admin ? undefined : session.user.id);

        //console.debug('Attachment', attachment);
        if (!attachment) {
            throw new HttpError(404, 'Not Found', 'Attachment not found');
        }

        const file = await fs.readFile(file_path);
        return new Response(file, {
            headers: {
                'Content-Type': attachment.mime,
                'Content-Disposition': `attachment; filename="${attachment.fileName}"`,
            },
        });
    } catch (error) {
        return errorHandler(error);
    }
}
