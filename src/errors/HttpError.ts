interface HttpErrorOptions {
    value?: string | null;
    context?: Record<string, any> | null;
}

export class HttpError extends Error {
    public readonly statusCode: number;
    public readonly title: string;
    public readonly detail: string;
    public readonly value: string | null;
    public readonly context: Record<string, any> | null;

    constructor(
        statusCode: number,
        title: string,
        detail: string,
        options: HttpErrorOptions = {}
    ) {
        super(title);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.title = title;
        this.detail = detail;
        this.value = options.value || null;
        this.context = options.context || null;
        Error.captureStackTrace(this, this.constructor);
    }

    public toJSON() {
        const json: Record<string, any> = {
            title: this.title,
            detail: this.detail,
            status: this.statusCode,
        };

        if (this.context) json.context = this.context;
        if (this.value) json.value = this.value;

        return json;
    }
}
