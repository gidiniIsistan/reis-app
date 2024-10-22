import { db } from "@/../db";
import * as schema from "@/schema";
import {and, eq, type InferInsertModel} from "drizzle-orm";

type NewQuestion = InferInsertModel<typeof schema.newQuestion>;


export const insertNewQuestion = async (data: NewQuestion) => {
    const [result] = await db
        .insert(schema.newQuestion)
        .values(data)
        .returning({id: schema.newQuestion.id, question: schema.newQuestion.question})

    return result;
}

export const getNewQuestion = async (id: string, user_id?: string) => {
    const query = db
        .select()
        .from(schema.newQuestion)
        .where(eq(schema.newQuestion.id, id));

    var result;

    if (user_id) {
        const sb = query.as('sb');
        [result] = await db
            .select({
                id: sb.id,
                question: sb.question,
            })
            .from(sb)
            .innerJoin(schema.userGroup, eq(sb.group_id, schema.userGroup.group_id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        [result] = await query;
    }

    return result;
};

export const deleteNewQuestion = async (id: string) => {
    const [result] = await db
        .delete(schema.newQuestion)
        .where(eq(schema.newQuestion.id, id))
        .returning({ id: schema.newQuestion.id });

    return result;
};

export const updateNewQuestion = async (id: string, text: string) => {
    const [result] = await db
        .update(schema.newQuestion)
        .set({ question: text })
        .where(eq(schema.newQuestion.id, id))
        .returning({ id: schema.newQuestion.id });

    return result;
};

export const getNewQuestions = async (class_id: string, group_id: string, user_id?: string) => {
    const query = db
        .select()
        .from(schema.newQuestion)
        .where(and(
            eq(schema.newQuestion.class_id, class_id),
            eq(schema.newQuestion.group_id, group_id)
        ));

    var result;

    if (user_id) {
        const sb = query.as('sb');
        result = await db
            .select({
                id: sb.id,
                question: sb.question,
            })
            .from(sb)
            .innerJoin(schema.userGroup, eq(sb.group_id, schema.userGroup.group_id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        result = await query;
    }

    return result;
};