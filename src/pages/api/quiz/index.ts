import type { APIRoute } from 'astro';
import { createQuiz, getQuizByUser  } from '@/services/quizService';
import { getClassByCode } from '@/services/classService';
import { createGroup } from '@/services/groupService';
import { acceptNewGroups, getGroupFromRecorrido, getRecorridoById } from '@/services/recorridoService';
import {checkSession} from '@/services/authService';
import { HttpError } from '@/errors/HttpError';
import { errorHandler } from '@/errors/errorHandler';
import {createNotification} from '@/services/notificationService';
import {getUserById} from '@/services/userService';


export const POST: APIRoute = async ({ request }) => {
    const data = await request.formData();

    try {
        const session = await checkSession(request);

        // HANDLE DATA
        const code = data.get('code') as string;

        if (!code || code.length !== 6) {
            throw new HttpError(400, 'Bad Request', 'El codigo debe tener 6 caracteres', { value: code });
        }

        // VALIDATE EXISITNG CLASS
        const classData = await getClassByCode(code);
        if (!classData) {
            throw new HttpError(404, 'Not Found', 'Clase no encontrada', { value: code });
        } else if (classData.end_date && new Date(classData.end_date) < new Date()) {
            throw new HttpError(403, 'Forbidden', `Clase finalizada el ${new Date(classData.end_date)}`, { value: code });
        }

        // VALIDATE EXISITNG QUIZ
        const quizData = await getQuizByUser(classData.id, session.user.id);
        if (quizData) {
            return new Response(JSON.stringify({
                success: true,
                data: quizData,
                message: 'Quiz already exists',
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const recorrido = await getRecorridoById(classData.recorrido_id);
        if (!recorrido) {//esto no falla
            throw new HttpError(404, 'Not Found', 'Recorrido no encontrado', { value: classData.recorrido_id });
        }

        // VALIDATE GROUP
        let groupData = await getGroupFromRecorrido(recorrido.id, session.user.id);

        let result;
        if (groupData) { // EXISTING GROUP BUT THERE IS NO QUIZ: create quiz
            result = await createQuiz(classData.id, groupData.id);
        } else if (await acceptNewGroups(classData.recorrido_id)) { // THERE IS NO GROUP AND THE RECORRIDO ACCEPTS NEW GROUPS: create both
            groupData = await createGroup(classData.recorrido_id, session.user.id);
            //notificar nuevo grupo
            await createNotification(
                recorrido.teacher_id,
                'Nuevo grupo',
                `Se ha unido un nuevo grupo a "${recorrido.title}"`
            );
            result = await createQuiz(classData.id, groupData.id);
        } else { // THERE IS NO GROUP AND THE RECORRIDO DOES NOT ACCEPT NEW GROUPS: error
            throw new HttpError(403, 'Forbidden', 'No se aceptan nuevos grupos', { value: recorrido.id });
        }

        const leader = await getUserById(groupData.lider_id);

        //crear notificacion
        await createNotification(
            recorrido.teacher_id,
            'Inicio de quiz',
            `El grupo de ${leader.name} se ha unido a la clase "${classData.title}"`
        );

        return new Response(JSON.stringify({
            success: true,
            message: 'Quiz created successfully',
            data: {
                class_id: result.class_id,
                group_id: result.group_id,
            },
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
