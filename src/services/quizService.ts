import { db } from "@/../db";
import * as schema from "@/schema";
import { and, eq, getTableColumns, type InferSelectModel } from 'drizzle-orm';

export type Quiz = InferSelectModel<typeof schema.quiz>;

export const getQuiz = async (class_id: string, group_id: string, user_id?: string) => {
    const query = db
        .select()
        .from(schema.quiz)
        .where(and(
            eq(schema.quiz.class_id, class_id),
            eq(schema.quiz.group_id, group_id),
        ));

    var result;
    if (user_id) {
        const sb = query.as('sb');
         [result] =  await db
            .select({
                class_id: sb.class_id,
                group_id: sb.group_id,
                gen_answer: sb.gen_answer,
                org_value: sb.org_value,
                org_answer: sb.org_answer,
                org_users: sb.org_users,
                created: sb.created,
                deleted: sb.deleted,
                modified: sb.modified,
                submitted: sb.submitted,
            })
            .from(sb)
            .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, sb.group_id))
            .where(eq(schema.userGroup.user_id, user_id))
    } else {
        [result] = await query;
    }
    return result;
}

export const getQuizByUser = async (class_id: string, user_id: string) => {
    const [result] = await db
        .select({...getTableColumns(schema.quiz)})
        .from(schema.quiz)
        .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, schema.quiz.group_id))
        .where(and(
            eq(schema.quiz.class_id, class_id),
            eq(schema.userGroup.user_id, user_id),
        ));

    return result;
}

export const getQuizWithAttachments = async (class_id: string, group_id: string, user_id?: string) => {
    const quiz = await getQuiz(class_id, group_id, user_id);

    if (!quiz || !quiz.class_id) {
        return null;
    }
    const attachments = await db
        .select({
            ...getTableColumns(schema.attachment),
        })
        .from(schema.quizAttachment)
        .innerJoin(schema.attachment, eq(schema.attachment.id, schema.quizAttachment.attachment_id))
        .where(and(
            eq(schema.quizAttachment.class_id, class_id),
            eq(schema.quizAttachment.group_id, group_id),
        ));

    return { ...quiz, attachments };
};

export async function createQuiz(class_id: string, group_id: string) {
    const [result] = await db.insert(schema.quiz).values({
        class_id,
        group_id,
        org_value: 1,
        org_users: '',
    }).returning();
    
    return result;
}

export const updateQuiz = async (class_id: string, group_id: string, data: Partial<Quiz>) => {
    const [result] = await db.update(schema.quiz)
        .set(data)
        .where(and(
            eq(schema.quiz.class_id, class_id),
            eq(schema.quiz.group_id, group_id),
        ))
        .returning();

    return result;
};

export const getQuizGroups = async (class_id: string) => {
    const result = await db
        .select({
            leader: schema.users.name,
            group_id: schema.quiz.group_id,
        })
        .from(schema.quiz)
        .innerJoin(schema.group, eq(schema.group.id, schema.quiz.group_id))
        .innerJoin(schema.users, eq(schema.users.id, schema.group.lider_id))
        .where(eq(schema.quiz.class_id, class_id));

    return result;
};