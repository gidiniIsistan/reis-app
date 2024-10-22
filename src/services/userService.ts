import { db } from "@/../db";
import * as schema from "@/schema";
import { and, eq, getTableColumns, type InferSelectModel} from 'drizzle-orm';

export type User = InferSelectModel<typeof schema.users>;

export const emptyUser = {
    id: '',
    name: '',
    email: '' as string | null,
    role: '',
    image: null as string | null,
    emailVerified: null as Date | null,
    last_seen: '',
    deleted: 0,
};

export const getUserGroupsByEmail = async (email: string) => {
    const [user] = await db
        .select()
        .from(schema.users)
        .where(and(
            eq(schema.users.email, email),
            eq(schema.users.deleted, 0),
        ));

    const groups = await db
        .select({
            ...getTableColumns(schema.group),
        })
        .from(schema.userGroup)
        .innerJoin(schema.group, eq(schema.group.id, schema.userGroup.group_id))
        .where(eq(schema.userGroup.user_id, user.id));

    return { user, groups };
};

export const getUserByEmail = async (email: string) => {
    const [user] = await db
        .select()
        .from(schema.users)
        .where(and(
            eq(schema.users.email, email),
            eq(schema.users.deleted, 0),
        ));

    return user;
};

export const getUserById = async (id: string) => {
    const [user] = await db
        .select()
        .from(schema.users)
        .where(and(
            eq(schema.users.id, id),
            eq(schema.users.deleted, 0),
        ));

    return user;
};
