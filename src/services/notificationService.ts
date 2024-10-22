import { db } from "@/../db";
import * as schema from "@/schema";
import { and, eq, type InferSelectModel } from 'drizzle-orm';

export type Notification = InferSelectModel<typeof schema.notification>;

export const getUserNotifications = async (user_id: string) => {
    return await db.query.notification.findMany({
        where: and(
            eq(schema.notification.user_id, user_id),
            eq(schema.notification.is_read, 0)
        )
    });
};

export const markNotificationAsRead = async (notification_id: string) => {
    const [result] = await db
        .update(schema.notification)
        .set({ is_read: 1 })
        .where(eq(schema.notification.id, notification_id))
        .returning({ id: schema.notification.id });

    return result;
};

export const markAllNotificationsAsRead = async (user_id: string) => {
    return await db
        .update(schema.notification)
        .set({ is_read: 1 })
        .where(eq(schema.notification.user_id, user_id))
        .returning({ id: schema.notification.id });
};

export const createNotification = async (user_id: string, title: string, message: string) => {
    const [result] = await db
        .insert(schema.notification)
        .values({
            user_id: user_id,
            title: title,
            message: message
        })
        .returning({ id: schema.notification.id });

    return result;
};

export const getNotificationById = async (notification_id: string) => {
    return await db.query.notification.findFirst({
        where: eq(schema.notification.id, notification_id)
    });
};
