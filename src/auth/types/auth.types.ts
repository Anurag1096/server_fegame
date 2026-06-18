export type AuthUserResponse = {
    id: number;
    username: string;
};

export type AuthSessionResult = {
    user: AuthUserResponse;
    accessToken: string;
    refreshToken: string;
};

/** @deprecated Use AuthSessionResult */
export type AuthResult = AuthSessionResult;
