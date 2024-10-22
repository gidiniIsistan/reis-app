import { db } from "@/../db";
import * as schema from "@/schema";
import { eq, getTableColumns } from 'drizzle-orm';
import {saveFile} from "./fileService";

export const saveQuestionAttachment = async (dx_question_id: string, file: File) => {
    // Extraer nombre original del archivo
    const fileName = file.name;
    // Guardar el archivo usando el servicio con su extensión correcta
    const fileNameWithoutExtension = `question-${Date.now()}`;

    // NOTE: por el momento solo se permite un archivo por pregunta asique se borra el anterior si existe
    const oldAtt = await db
        .delete(schema.questionAttachment)
        .where(eq(schema.questionAttachment.question_id, dx_question_id))
        .returning({ id: schema.questionAttachment.attachment_id });

    // Si había un archivo anterior, borrarlo
    oldAtt.forEach(async (old) => {
        // questionAttachment se borra en cascada
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

    // Asociar el archivo a la pregunta
    await db.insert(schema.questionAttachment).values({
        question_id: dx_question_id,
        attachment_id: att.id,
    });
};


export const getQuestionAttachment = async (filePath: string, user_id?: string) => {
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
            .innerJoin(schema.questionAttachment, eq(schema.questionAttachment.attachment_id, sb.id))
            .innerJoin(schema.dxQuestion, eq(schema.dxQuestion.id, schema.questionAttachment.question_id))
            .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, schema.dxQuestion.group_id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        [result] = await query;
    }

    return result;
};

export const getAttachmentsbyQuestionId = async (question_id: string, user_id?: string) => {
    const query = db
        .select({
            ...getTableColumns(schema.attachment),
            question_id: schema.questionAttachment.question_id,
        })
        .from(schema.attachment)
        .innerJoin(schema.questionAttachment, eq(schema.questionAttachment.attachment_id, schema.attachment.id))
        .where(eq(schema.questionAttachment.question_id, question_id));

    var result;
    if (user_id) {
        const sb = query.as('sb');
        result = await db
            .select({
                id: sb.id,
                filePath: sb.filePath,
                fileName: sb.fileName,
                mime: sb.mime,
                fileSize: sb.fileSize,
            })
            .from(sb)
            .innerJoin(schema.dxQuestion, eq(schema.dxQuestion.id, sb.question_id))
            .innerJoin(schema.userGroup, eq(schema.userGroup.group_id, schema.dxQuestion.group_id))
            .where(eq(schema.userGroup.user_id, user_id));
    } else {
        result = await query;
    }

    return result;
};
