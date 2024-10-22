import type { APIRoute } from 'astro';
import * as schema from "@/schema";
import {checkAdminPermissions, checkSession} from '@/services/authService';
import {getQuiz, getQuizGroups, getQuizWithAttachments, updateQuiz, type Quiz} from '@/services/quizService';
import {getGroupUsers, isUserInGroup} from '@/services/groupService';
import {HttpError} from '@/errors/HttpError';
import {errorHandler} from '@/errors/errorHandler';


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
            
            const result = await getQuizGroups(class_id);
    
            return new Response(JSON.stringify({
                success: true,
                message: 'Groups retrieved successfully',
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