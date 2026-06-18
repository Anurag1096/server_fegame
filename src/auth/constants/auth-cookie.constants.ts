import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'accessToken';
export const REFRESH_COOKIE_NAME = 'refreshToken';
export const AUTH_COOKIE_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getBaseCookieOptions(maxAge: number): CookieOptions {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge,
        path: '/',
    };
}

function getBaseClearCookieOptions(): CookieOptions {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    };
}

export function getAuthCookieOptions(): CookieOptions {
    return getBaseCookieOptions(AUTH_COOKIE_MAX_AGE_MS);
}

export function getRefreshCookieOptions(): CookieOptions {
    return getBaseCookieOptions(REFRESH_COOKIE_MAX_AGE_MS);
}

export function getAuthCookieClearOptions(): CookieOptions {
    return getBaseClearCookieOptions();
}

export function getRefreshCookieClearOptions(): CookieOptions {
    return getBaseClearCookieOptions();
}

export function extractTokenFromCookieHeader(
    cookieHeader: string | undefined,
    cookieName: string = AUTH_COOKIE_NAME,
): string | undefined {
    if (!cookieHeader) {
        return undefined;
    }

    for (const cookie of cookieHeader.split(';')) {
        const [name, ...valueParts] = cookie.trim().split('=');
        if (name === cookieName) {
            const value = valueParts.join('=');
            return value ? decodeURIComponent(value) : undefined;
        }
    }

    return undefined;
}
