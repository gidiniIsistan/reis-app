/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
    readonly AUTH_GOOGLE_ID: string;
    readonly AUTH_GOOGLE_SECRET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}