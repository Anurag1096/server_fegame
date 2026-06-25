export function getPrimaryFrontendUrl(): string {
    const fromEnv = process.env.FRONTEND_URL?.trim();

    if (!fromEnv) {
        return 'http://localhost:3000';
    }

    return fromEnv.split(',')[0]?.trim() || 'http://localhost:3000';
}

export function getGoogleCallbackUrl(): string {
    return (
        process.env.GOOGLE_CALLBACK_URL ??
        `${getPrimaryFrontendUrl()}/api/auth/google/callback`
    );
}

export function getGithubCallbackUrl(): string {
    return (
        process.env.GITHUB_CALLBACK_URL ??
        `${getPrimaryFrontendUrl()}/api/auth/github/callback`
    );
}

function hasEnvValue(name: string): boolean {
    return Boolean(process.env[name]?.trim());
}

export function isGoogleOAuthConfigured(): boolean {
    return hasEnvValue('GOOGLE_CLIENT_ID') && hasEnvValue('GOOGLE_CLIENT_SECRET');
}

export function isGithubOAuthConfigured(): boolean {
    return hasEnvValue('GITHUB_CLIENT_ID') && hasEnvValue('GITHUB_CLIENT_SECRET');
}
