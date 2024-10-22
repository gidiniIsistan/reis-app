import { db } from "@/../db";
import * as schema from "@/schema";
import { eq, type InferSelectModel } from 'drizzle-orm';

export type Source = InferSelectModel<typeof schema.source>;

export const getSourceById = async (source_id: string, user_id?: string) => {
    const query = db
        .select()
        .from(schema.source)
        .where(eq(schema.source.id, source_id));

    var result;
    if (user_id) {
        const sb = query.as('sb');
        [result] = await db
            .select({
                id: sb.id,
                details: sb.details,
                extra_details: sb.extra_details,
                type: sb.type,
                rating: sb.rating,
                dx_question_id: sb.dx_question_id,
            })
            .from(sb)
            .innerJoin(schema.dxQuestion, eq(sb.dx_question_id, schema.dxQuestion.id))
            .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, schema.dxQuestion.group_id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        [result] = await query;
    }

    return result;
};


export const getSourcesByQuestionId = async (dx_question_id: string, user_id?: string) => {
    const query = db
        .select()
        .from(schema.source)
        .where(eq(schema.source.dx_question_id, dx_question_id));

    var result;
    if (user_id) {
        const sb = query.as('sb');
        result = await db
            .select({
                id: sb.id,
                details: sb.details,
                extra_details: sb.extra_details,
                type: sb.type,
                rating: sb.rating,
                dx_question_id: sb.dx_question_id,
            })
            .from(sb)
            .innerJoin(schema.dxQuestion, eq(sb.dx_question_id, schema.dxQuestion.id))
            .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, schema.dxQuestion.group_id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        result = await query;
    }

    return result;
};

export const deleteSource = async (source_id: string) => {
    const [result] = await db
        .delete(schema.source)
        .where(eq(schema.source.id, source_id))
        .returning({ id: schema.source.id });

    return result;
};

export const updateSource = async (source_id: string, data: Partial<Source>) => {
    const [result] = await db
        .update(schema.source)
        .set(data)
        .where(eq(schema.source.id, source_id))
        .returning({ id: schema.source.id });

    return result;
};

export const createSource = async (type: string, dx_question_id: string) => {
    const [result] = await db
        .insert(schema.source)
        .values({
            type,
            dx_question_id,
            rating: 1,
            details: '',
        })
        .returning({ id: schema.source.id });

    return result;
}
