import * as argon2 from "argon2";

import { Injectable } from "@nestjs/common";

export async function verifyPassword(
    hashedPassword: string,
    plainPassword: string,
): Promise<boolean> {
    try {
        return await argon2.verify(hashedPassword, plainPassword);
    } catch {
        return false;
    }
}

export async function hashPassword(password: string): Promise<{ hashedPassword?: string | null }> {
    //need to figure out the error type
    try {
        const hashedPassword = await argon2.hash(password)
        return { hashedPassword }
    } catch (error) {
        console.error("Error in hashing password", error)
        return { hashedPassword: null }
    }
}

// this is the classbased implementaiton
@Injectable()
export class EncryptPassword {

    async hashPassword(password: string): Promise<{ hashedPassword: string | null }> {
        try {
            const hashedPassword = await argon2.hash(password)
            return { hashedPassword }
        } catch (error) {
            console.error("Error in hashing password", error)
            return { hashedPassword: null }
        }
    }
}
