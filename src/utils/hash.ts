import * as argon2 from "argon2";
export async function hashPassword(password: string): Promise<{ hashedPassword?: string | null}> {
//need to figure out the error type
    try {
        const hashedPassword = await argon2.hash(password)
        return { hashedPassword, }
    } catch (error) {
        console.error("Error in hashing password",error)
        return { hashedPassword: null }
    }
}