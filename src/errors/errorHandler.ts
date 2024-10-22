import { HttpError } from './HttpError';

export function errorHandler(error: unknown): Response {
    let statusCode = 500;
    let title = 'Internal Server Error';
    let detail = 'An unexpected error occurred.';
    let additionalData: Record<string, any> = {};

    if (error instanceof HttpError) {
        statusCode = error.statusCode;
        title = error.title;
        detail = error.detail;
        additionalData = error.toJSON();
    }

    return new Response(
        JSON.stringify({
            success: false,
            title,
            detail,
            status: statusCode,
            ...additionalData,
        }),
        {
            status: statusCode,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
}
