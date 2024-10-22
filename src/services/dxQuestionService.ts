import { db } from "@/../db";
import * as schema from "@/schema";
import { and, eq, type InferSelectModel } from 'drizzle-orm';

export type DxQuestion = InferSelectModel<typeof schema.dxQuestion>;

export const getDxQuestions = async (class_id: string, group_id: string, user_id?: string) => {
    const query = db
        .select()
        .from(schema.dxQuestion)
        .where(and(
            eq(schema.dxQuestion.class_id, class_id),
            eq(schema.dxQuestion.group_id, group_id)
        ));

    var result;
    if (user_id) {
        const sb = query.as('sb');
        result = await db
            .select({
                id: sb.id,
                class_id: sb.class_id,
                group_id: sb.group_id,
                question: sb.question,
                dx_answer: sb.dx_answer,
                subject: sb.subject,
                topic: sb.topic,
                issues: sb.issues,
            })
            .from(sb)
            .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, sb.group_id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        result = await query;
    }

    return result;
};

export const getDxQuestionById = async (dx_question_id: string, user_id?: string) => {
    const query = db
        .select()
        .from(schema.dxQuestion)
        .where(eq(schema.dxQuestion.id, dx_question_id));

    var result;
    if (user_id) {
        const sb = query.as('sb');
        [result] = await db
            .select({
                id: sb.id,
                class_id: sb.class_id,
                group_id: sb.group_id,
                question: sb.question,
                dx_answer: sb.dx_answer,
                subject: sb.subject,
                topic: sb.topic,
                issues: sb.issues,
            })
            .from(sb)
            .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, sb.group_id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        [result] = await query;
    }

    return result;
};


export const deleteDxQuestion = async (dx_question_id: string) => {
    const [result] = await db
        .delete(schema.dxQuestion)
        .where(eq(schema.dxQuestion.id, dx_question_id))
        .returning({ id: schema.dxQuestion.id });

    return result;
};


export const updateDxQuestion = async (dx_question_id: string, data: Partial<DxQuestion>) => {
    const [result] = await db
        .update(schema.dxQuestion)
        .set(data)
        .where(eq(schema.dxQuestion.id, dx_question_id))
        .returning({ id: schema.dxQuestion.id });

    return result;
};

export const createDxQuestion = async (class_id: string, group_id: string, question: string) => {
    const [result] = await db
        .insert(schema.dxQuestion)
        .values({
            class_id,
            group_id,
            question,
            dx_answer: '',
            subject: '',
            topic: '',
            issues: '',
        })
        .returning({ id: schema.dxQuestion.id });

    return result;
}
