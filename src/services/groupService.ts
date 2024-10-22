import { db } from "@/../db";
import * as schema from "@/schema";
import { and, eq, getTableColumns, type InferSelectModel} from 'drizzle-orm';

export type Group = InferSelectModel<typeof schema.group>;

export const emptyGroup = {
    id: '',
    recorrido_id: '',
    lider_id: '' as string,
    deleted: 0,
};
export const getGroupUsers = async (group_id: string) => {
    return db
        .select({
            ...getTableColumns(schema.users),
        })
        .from(schema.users)
        .innerJoin(schema.userGroup, eq(schema.userGroup.user_id, schema.users.id))
        .innerJoin(schema.group, eq(schema.group.id, schema.userGroup.group_id))
        .where(and(
            eq(schema.userGroup.group_id, group_id),
            eq(schema.group.deleted, 0),
        ));
};

export const isUserInGroup = async (group_id: string, user_id: string) => {
    const [user] = await db
        .select()
        .from(schema.userGroup)
        .where(and(
            eq(schema.userGroup.group_id, group_id),
            eq(schema.userGroup.user_id, user_id),
        ));

    return !!user;
};

export const createGroup = async (recorrido_id: string, user_id: string) => {
    const [group] = await db.insert(schema.group).values({
        recorrido_id,
        lider_id: user_id,
    }).returning();

    await db.insert(schema.userGroup).values({
        user_id,
        group_id: group.id,
    });

    return group;
};

export const getGroup = async (group_id: string, user_id?: string) => {
    const query = db
        .select()
        .from(schema.group)
        .where(and(
            eq(schema.group.id, group_id),
            eq(schema.group.deleted, 0),
        ));

    var result;
    if (user_id) {
        const sb = query.as('sb');
        [result] = await db
            .select({
                id: sb.id,
                recorrido_id: sb.recorrido_id,
                lider_id: sb.lider_id,
                deleted: sb.deleted,
            })
            .from(sb)
            .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, sb.id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        [result] = await query;
    }

    return result;
};

export const softDeleteGroup = async (group_id: string, user_id: string) => {
    const [result] = await db.update(schema.group)
        .set({ deleted: 1 })
        .where(and(
            eq(schema.group.id, group_id),
            eq(schema.group.lider_id, user_id),
        ))
        .returning({ id: schema.group.id });

    if (result) {
        await db
            .delete(schema.userGroup)
            .where(eq(schema.userGroup.group_id, group_id));
    }

    return result;
};

export const removeUserFromGroup = async(group_id: string, user_id: string) => {
    const [result] = await db
        .delete(schema.userGroup)
        .where(and(
            eq(schema.userGroup.group_id, group_id),
            eq(schema.userGroup.user_id, user_id),
        ))
        .returning({ user_id: schema.userGroup.user_id });

    return result;
};

export const addUserToGroup = async(group_id: string, user_id: string) => {
    const [result] = await db
        .insert(schema.userGroup)
        .values({
            user_id,
            group_id,
    })
    .returning({ user_id: schema.userGroup.user_id });

    return result;
}
