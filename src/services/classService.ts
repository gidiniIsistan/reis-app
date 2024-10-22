import { db } from "@/../db";
import {HttpError} from "@/errors/HttpError";
import * as schema from "@/schema";
import { and, eq, getTableColumns, type InferSelectModel } from 'drizzle-orm';

export type ClassType = InferSelectModel<typeof schema.classTable>;

export const getTeacherClasses = async (recorrido_id: string, teacher_id: string) => {
     return await db
        .select({
            ...getTableColumns(schema.classTable),
            gen_question: schema.recorrido.gen_question,
            teacher: schema.users.name,
            teacherImg: schema.users.image,
            recorrido_title: schema.recorrido.title,
        })
        .from(schema.recorrido)
        .innerJoin(schema.users, eq(schema.recorrido.teacher_id, schema.users.id))
        .innerJoin(schema.classTable, eq(schema.recorrido.id, schema.classTable.recorrido_id))
        .where(and(
            eq(schema.recorrido.id, recorrido_id),
            eq(schema.recorrido.teacher_id, teacher_id),
        ));
};

export const getUserClasses = async (recorrido_id: string, user_id: string) => {
    return await db
        .select({
            ...getTableColumns(schema.classTable),
            gen_question: schema.recorrido.gen_question,
            group_id: schema.quiz.group_id,//TODO: check if this is correct
            teacher: schema.users.name,
            teacherImg: schema.users.image,
            recorrido_title: schema.recorrido.title,
        })
        .from(schema.classTable)
        .innerJoin(schema.recorrido, eq(schema.recorrido.id, schema.classTable.recorrido_id))
        .innerJoin(schema.users, eq(schema.recorrido.teacher_id, schema.users.id))
        .innerJoin(schema.quiz, eq(schema.classTable.id, schema.quiz.class_id))
        .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, schema.quiz.group_id))
        .where(and(
                eq(schema.userGroup.user_id, user_id),
                eq(schema.classTable.recorrido_id, recorrido_id),
        ));
};

export const getClassById = async (class_id: string) => {
    const [result] = await db
        .select({
            ...getTableColumns(schema.classTable),
            gen_question: schema.recorrido.gen_question,
            //group_id: schema.quiz.group_id,//TODO: check if this is correct
            teacher: schema.users.name,
            teacherImg: schema.users.image,
            recorrido_title: schema.recorrido.title,
        })
        .from(schema.classTable)
        .innerJoin(schema.recorrido, eq(schema.recorrido.id, schema.classTable.recorrido_id))
        .innerJoin(schema.users, eq(schema.recorrido.teacher_id, schema.users.id))
        //.innerJoin(schema.quiz, eq(schema.classTable.id, schema.quiz.class_id))
        .where(eq(schema.classTable.id, class_id));

    return result;
};


export const getClassByCode = async (code: string) => {
    const [result] = await db
        .select({
            ...getTableColumns(schema.classTable),
            recorrido: schema.recorrido.title,
            teacher: schema.users.name,
            teacherImg: schema.users.image,
        })
        .from(schema.classTable)
        .innerJoin(schema.recorrido, eq(schema.recorrido.id, schema.classTable.recorrido_id))
        .innerJoin(schema.users, eq(schema.recorrido.teacher_id, schema.users.id))
        .where(and(
            eq(schema.classTable.entercode, code),
        ));

    return result;
};


function createCode() {
    return Math.random().toString(36).substring(2, 5).toUpperCase() + Math.floor(100 + Math.random() * 900);
}

export const createClass = async (recorrido_id: string, title: string, desc: string | null, start_date: string, end_date: string | null) => {
    let attempt = 0;
    const maxAttempts = 5;

    while (attempt < maxAttempts) {
        const code = createCode();

        try {
            const [result] = await db
                .insert(schema.classTable)
                .values({
                    title: title,
                    desc: desc || null,
                    start_date: start_date,
                    end_date: end_date || schema.classTable.end_date.default,
                    recorrido_id: recorrido_id,
                    entercode: code,
                })
                .returning({ id: schema.classTable.id });

            return result;
        } catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                attempt++;
            } else {
                throw error;
            }
        }
    }

    throw new HttpError(500, 'Internal Server Error', 'Failed to create class: too many attempts');
}

export const updateClass = async (class_id: string, data: Partial<ClassType>) => {
    const [result] = await db
        .update(schema.classTable)
        .set(data)
        .where(eq(schema.classTable.id, class_id))
        .returning({ id: schema.classTable.id });

    return result;
}

export const deleteClass = async (class_id: string) => {
    const [result] = await db
        .delete(schema.classTable)
        .where(eq(schema.classTable.id, class_id))
        .returning({ id: schema.classTable.id });

    return result;
}

export const getLastestTeacherClasses = async (teacher_id: string, limit: number) => {
    return await db
        .select({
            ...getTableColumns(schema.classTable),
            recorrido_title: schema.recorrido.title,
            gen_question: schema.recorrido.gen_question,
            teacher: schema.users.name,
            teacherImg: schema.users.image,
        })
        .from(schema.classTable)
        .innerJoin(schema.recorrido, eq(schema.recorrido.id, schema.classTable.recorrido_id))
        .innerJoin(schema.users, eq(schema.recorrido.teacher_id, schema.users.id))
        .where(eq(schema.recorrido.teacher_id, teacher_id))
        .orderBy(schema.classTable.start_date)
        .limit(limit);
};
