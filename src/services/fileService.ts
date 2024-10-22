import { promises as fs } from 'fs';
import path from 'path';

export async function saveFile(blob: Blob, fileNameWithoutExtension: string): Promise<{ filePath: string }> {
    const buffer = await blob.arrayBuffer();
    const arrayBuffer = new Uint8Array(buffer);
    const uploadDir = path.join(import.meta.env.UPLOADS_DIR);

    // Crear la carpeta uploads si no existe
    await fs.mkdir(uploadDir, { recursive: true });

    // Obtener la extensión del archivo desde el tipo MIME
    const mimeType = blob.type; // Ejemplo: 'image/png'
    const extension = mimeType.split('/')[1]; // Extrae 'png'
    const fileName = `${fileNameWithoutExtension}.${extension}`;

    // Definir la ruta completa del archivo
    const filePath = path.join(uploadDir, fileName);

    // Escribir el archivo
    await fs.writeFile(filePath, arrayBuffer);

    return { filePath };
}

export async function deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
}

export function checkResource(resource: string): [string, string] {
    const parts = resource.split('-');
    if (parts.length !== 2) {
        throw new Error('Invalid resource format');
    }
    return parts as [string, string];
}
