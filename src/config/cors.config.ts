import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

export function getAllowedOrigins(): string[] {
    const fromEnv = process.env.FRONTEND_URL?.trim();

    if (!fromEnv) {
        return DEFAULT_ORIGINS;
    }

    return fromEnv
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}

export function getHttpCorsOptions(): CorsOptions {
    const allowedOrigins = getAllowedOrigins();

    return {
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, origin ?? allowedOrigins[0]);
                return;
            }

            callback(new Error(`Origin ${origin} is not allowed by CORS`));
        },
        credentials: true,
    };
}

export function getSocketCorsOptions() {
    return {
        origin: getAllowedOrigins(),
        credentials: true,
    };
}
