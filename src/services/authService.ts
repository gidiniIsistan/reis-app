import { db } from "@/../db";
import * as schema from "@/schema";
import { and, eq  } from 'drizzle-orm';
import {getSession} from 'auth-astro/server';
import {HttpError} from "@/errors/HttpError";

export const checkSession = async (request: Request) => {
    const session = await getSession(request);
    if (!session) {
        throw new HttpError(401, 'Unauthorized', 'Session not found');
    }

    return session;
};

export const checkAdminPermissions = async (class_id: string, session: any) => {
    const admin = session?.user?.role === "teacher";
    if (admin) {
        const cls = await db
            .select()
            .from(schema.classTable)
            .leftJoin(schema.recorrido, eq(schema.recorrido.id, schema.classTable.recorrido_id))
            .where(and(
                eq(schema.classTable.id, class_id),
                eq(schema.recorrido.teacher_id, session.user.id),
            ));

        if (!cls || cls.length === 0) {
            throw new HttpError(403, 'Forbidden', 'Teacher is not the owner of this class');
        }
    }

    return admin;
};


export const checkTeacherRecorrido = async (recorrido_id: string, session: any) => {
    const teacher = session?.user?.role === "teacher";
    if (teacher) {
        const recorrido = await db
            .select()
            .from(schema.recorrido)
            .where(and(
                eq(schema.recorrido.id, recorrido_id),
                eq(schema.recorrido.teacher_id, session.user.id),
            ));

        if (!recorrido || recorrido.length === 0) {
            throw new HttpError(403, 'Forbidden', 'Teacher is not the owner of this recorrido');
        }
    }

    return teacher;
}
