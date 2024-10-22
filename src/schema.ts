import type { AdapterAccountType } from "@auth/core/adapters";
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, primaryKey, type AnySQLiteColumn, uniqueIndex, foreignKey } from "drizzle-orm/sqlite-core";

// Definición de la tabla "user"
export const users = sqliteTable('user', {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text("email").unique(),
    emailVerified: integer("emailVerified", {
        mode: "timestamp_ms"
    }),
    image: text("image"),
    role: text("role").notNull().default("user"),
    last_seen: text('last_seen').notNull().default(sql`current_timestamp`),
    deleted: integer('deleted').notNull().default(0),
});

// Definición de la tabla "account"
export const accounts = sqliteTable("account", {
    userId: text("userId")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade"
        }),
    type: text("type").$type < AdapterAccountType > ().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
}, (account) => ({
    compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
    }),
}));

// Definición de la tabla "session"
export const sessions = sqliteTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade"
        }),
    expires: integer("expires", {
        mode: "timestamp_ms"
    }).notNull(),
});

// Definición de la tabla "verificationToken"
export const verificationTokens = sqliteTable("verificationToken", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", {
        mode: "timestamp_ms"
    }).notNull(),
}, (verificationToken) => ({
    compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
    }),
}));

export const authenticators = sqliteTable("authenticator", {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, {
            onDelete: "cascade"
        }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
        mode: "boolean"
    }).notNull(),
    transports: text("transports"),
}, (authenticator) => ({
    compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
    }),
}));

// Definición de la tabla "group"
export const group = sqliteTable('group', {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    lider_id: text('lider_id')
        .references((): AnySQLiteColumn => users.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict'
        })
        .notNull(),
    deleted: integer('deleted').notNull().default(0),
    recorrido_id: text('recorrido_id')
        .references(() => recorrido.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict'
        })
        .notNull(),
});

// Definición de la tabla "user_group"
export const userGroup = sqliteTable('user_group', {
    user_id: text('user_id')
        .references(() => users.id, {
            onUpdate: 'cascade',
            onDelete: 'cascade'
        })
        .notNull(),
    group_id: text('group_id')
        .references(() => group.id, {
            onUpdate: 'cascade',
            onDelete: 'cascade'
        })
        .notNull(),
}, (table) => {
    return {
        pk: primaryKey({
            columns: [table.user_id, table.group_id]
        }),
    };
});

// Definición de la tabla "recorrido"
export const recorrido = sqliteTable('recorrido', {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    title: text('title').notNull(),
    desc: text('desc').notNull(),
    gen_question: text('gen_question').notNull(),
    created: text('created').notNull().default(sql`current_timestamp`),
    is_active: integer('is_active').notNull().default(1),
    teacher_id: text('teacher_id')
        .references(() => users.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict'
        })
        .notNull(),
});

// Definición de la tabla "class"
export const classTable = sqliteTable('class', {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    title: text('title').notNull(),
    desc: text('desc'),
    entercode: text('entercode').notNull().unique(),
    start_date: text('start_date').notNull().default(sql`current_timestamp`),
    end_date: text('end_date'),
    deleted: integer('deleted').notNull().default(0),
    recorrido_id: text('recorrido_id')
        .references(() => recorrido.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict'
        })
        .notNull(),
}, (table) => {
    return {
        codeIdx: uniqueIndex("codeIdx").on(table.entercode),
    };
});

// Definición de la tabla "quiz"
export const quiz = sqliteTable('quiz', {
    group_id: text('group_id')
        .references(() => group.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict'
        })
        .notNull(),
    class_id: text('class_id')
        .references(() => classTable.id, {
            onUpdate: 'cascade',
            onDelete: 'restrict'
        })
        .notNull(),
    gen_answer: text('gen_answer'),
    org_value: integer('org_value').notNull(),
    org_answer: text('org_answer'),
    org_users: text('org_users').notNull(),
    submitted: integer('submitted').notNull().default(0),
    deleted: integer('deleted').notNull().default(0),
    created: text('created').notNull().default(sql`current_timestamp`),
    modified: text('modified').notNull().default(sql`current_timestamp`),
}, (table) => {
    return {
        pk: primaryKey({
            columns: [table.group_id, table.class_id]
        }),
    };
});

// Definición de la tabla "dx_question"
export const dxQuestion = sqliteTable('dx_question', {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    question: text('question').notNull(),
    class_id: text('class_id').notNull(),
    group_id: text('group_id').notNull(),
    dx_answer: text('dx_answer'),
    subject: text('subject').notNull(),
    topic: text('topic').notNull(),
    issues: text('issues'),
}, (table) => {
    return {
            fk: foreignKey({
                columns: [table.class_id, table.group_id],
                foreignColumns: [quiz.class_id, quiz.group_id],
            }).onDelete('cascade').onUpdate('cascade'),
        }
    }
);

// Definición de la tabla "source"
export const source = sqliteTable('source', {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    type: text('type').notNull(),
    details: text('details').notNull(),
    extra_details: text('extra_details'),
    rating: integer('rating').notNull(),
    dx_question_id: text('dx_question_id')
        .references(() => dxQuestion.id, {
            onUpdate: 'cascade',
            onDelete: 'cascade'
        })
        .notNull(),
});

// Definición de la tabla "attachment"
 export const attachment = sqliteTable('attachment', {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    filePath: text('filePath').notNull(),
    fileName: text('fileName').notNull(),
    mime: text('mime').notNull(),
    fileSize: integer('fileSize').notNull(),
    uploaded_at: text('uploaded_at').notNull().default(sql`current_timestamp`),
});

// Definición de la tabla "question_attachment"
export const questionAttachment = sqliteTable('question_attachment', {
    question_id: text('question_id')
        .references(() => dxQuestion.id, {
            onUpdate: 'cascade',
            onDelete: 'cascade'
        })
        .notNull(),
    attachment_id: text('attachment_id')
        .references(() => attachment.id, {
            onUpdate: 'cascade',
            onDelete: 'cascade'
        })
        .notNull(),
}, (table) => {
    return {
        pk: primaryKey({
            columns: [table.question_id, table.attachment_id]
        }),
    };
});

// Definicion de la tabla "quiz_attachment"
export const quizAttachment = sqliteTable('quiz_attachment', {
    group_id: text('group_id').notNull(),
    class_id: text('class_id').notNull(),
    attachment_id: text('attachment_id')
        .references(() => attachment.id, {
            onUpdate: 'cascade',
            onDelete: 'cascade'
        })
        .notNull(),
}, (table) => {
    return {
        pk: primaryKey({
            columns: [table.group_id, table.class_id, table.attachment_id]
        }),
        fk: foreignKey({
            columns: [table.class_id, table.group_id],
            foreignColumns: [quiz.class_id, quiz.group_id],
        }).onDelete('cascade').onUpdate('cascade'),
    };
});

// Definición de la tabla "new_question"
export const newQuestion = sqliteTable('new_question', {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    question: text('question').notNull(),
    class_id: text('class_id').notNull(),
    group_id: text('group_id').notNull(),
}, (table) => {
    return {
        fk: foreignKey({
            columns: [table.class_id, table.group_id],
            foreignColumns: [quiz.class_id, quiz.group_id],
        }).onDelete('cascade').onUpdate('cascade'),
    };
});


// Definición de la tabla "notification"
export const notification = sqliteTable('notification', {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    user_id: text('user_id')
        .references(() => users.id, {
            onUpdate: 'cascade',
            onDelete: 'cascade'
        })
        .notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    is_read: integer('is_read').notNull().default(0),
    created: text('created').notNull().default(sql`current_timestamp`),
});
