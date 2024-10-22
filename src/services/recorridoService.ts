import { db } from "@/../db";
import * as schema from "@/schema";
import { and, eq, getTableColumns, type InferSelectModel } from 'drizzle-orm';

export type Recorrido = InferSelectModel<typeof schema.recorrido>;

export const acceptNewGroups = async (recorrido_id: string) => {
    const [recorrido] = await db
        .select()
        .from(schema.recorrido)
        .where(eq(schema.recorrido.id, recorrido_id));

    if (!recorrido) {
        throw new Error('Not Found');
    }

    return recorrido.is_active;
};

export const insertRecorrido = async (teacher_id: string, title: string = '', gen_question: string = '', desc: string = '') => {
    const [result] = await db
        .insert(schema.recorrido)
        .values({
            title,
            desc: desc,
            gen_question,
            teacher_id,
        })
        .returning({ id: schema.recorrido.id });

    return result;
}

export const updateRecorrido = async (recorrido_id: string, data: Partial<Recorrido>) => {
    const [result] = await db
        .update(schema.recorrido)
        .set(data)
        .where(eq(schema.recorrido.id, recorrido_id))
        .returning({ id: schema.recorrido.id });

    return result;
};

export const deleteRecorrido = async (recorrido_id: string) => {
    const [result] = await db
        .delete(schema.recorrido)
        .where(eq(schema.recorrido.id, recorrido_id))
        .returning({ id: schema.recorrido.id });

    return result;
};

export const getTeacherRecorridos = async (teacher_id: string) => {
    return await db
        .select()
        .from(schema.recorrido)
        .where(eq(schema.recorrido.teacher_id, teacher_id));
};

export const getTeacherRecorrido = async (id: string, teacher_id: string) => {
    const [result] = await db
        .select()
        .from(schema.recorrido)
        .where(and(
            eq(schema.recorrido.id, id),
            eq(schema.recorrido.teacher_id, teacher_id)
        ));
    
    return result;
};

export const getUserRecorridos = async (user_id: string) => {
    return await db
    .select({
        ...getTableColumns(schema.recorrido),
        group_id: schema.group.id,
    })
    .from(schema.userGroup)
    .innerJoin(schema.group, eq(schema.userGroup.group_id, schema.group.id))
    .innerJoin(schema.recorrido, eq(schema.group.recorrido_id, schema.recorrido.id))
    .where(eq(schema.userGroup.user_id, user_id));
};

export const getRecorridoById = async (recorrido_id: string) => {
    return await db.query.recorrido.findFirst({
        where: eq(schema.recorrido.id, recorrido_id)
    });
};

export const getGroupFromRecorrido = async (recorrido_id: string, user_id: string) => {
    const [result] = await db
        .select({
            ...getTableColumns(schema.group),
        })
        .from(schema.recorrido)
        .innerJoin(schema.group, eq(schema.group.recorrido_id, schema.recorrido.id))
        .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, schema.group.id))
        .where(and(
            eq(schema.recorrido.id, recorrido_id),
            eq(schema.userGroup.user_id, user_id)
        ))
        .limit(1); // technically, there should be only one group per user per recorrido

    return result;
};
