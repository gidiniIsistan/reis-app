import { db } from "@/../db";
import * as schema from "@/schema";
import { and, eq, type InferSelectModel } from 'drizzle-orm';
import {saveFile} from "./fileService";

export type Attachment = InferSelectModel<typeof schema.attachment>;

export const saveQuizAttachment = async (class_id: string, group_id: string, file: File) => {
    // Extraer nombre original del archivo
    const fileName = file.name;
    // Guardar el archivo usando el servicio con su extensión correcta
    const fileNameWithoutExtension = `quiz-${Date.now()}`;

    // NOTE: por el momento solo se permite un archivo por quiz asique se borra el anterior si existe
    const oldAtt = await db
    .delete(schema.quizAttachment)
    .where(and(
        eq(schema.quizAttachment.class_id, class_id),
        eq(schema.quizAttachment.group_id, group_id),
    )).returning({ id: schema.quizAttachment.attachment_id });

    // Si había un archivo anterior, borrarlo
    oldAtt.forEach(async (old) => {
        // quizAttachment se borra en cascada
        await db.delete(schema.attachment).where(eq(schema.attachment.id, old.id));
    });

    // guardo el archivo en el servidor
    const { filePath } = await saveFile(file, fileNameWithoutExtension);
    // guardar metadatos en la base de datos
    const [att] = await db.insert(schema.attachment).values({
        filePath: filePath,
        fileName: fileName,
        mime: file.type,
        fileSize: file.size,
    }).returning({ id: schema.attachment.id });

    // Asociar el archivo al quiz
    await db.insert(schema.quizAttachment).values({
        class_id,
        group_id,
        attachment_id: att.id,
    });
};

export const getQuizAttachment = async (filePath: string, user_id?: string) => {
    const query = db
        .select()
        .from(schema.attachment)
        .where(eq(schema.attachment.filePath, filePath));

    var result;
    if (user_id) {
        const sb = query.as('sb');
        [result] = await db
            .select({
                id: sb.id,
                filePath: sb.filePath,
                fileName: sb.fileName,
                mime: sb.mime,
                fileSize: sb.fileSize,
            })
            .from(sb)
            .innerJoin(schema.quizAttachment, eq(schema.quizAttachment.attachment_id, sb.id))
            .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, schema.quizAttachment.group_id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        [result] = await query;
    }

    return result;
}
