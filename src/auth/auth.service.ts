import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/Features/User/user.service';
import { hashPassword, verifyPassword } from 'src/utils/hash';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async signUp(
        username: string,
        email: string,
        password: string,
    ): Promise<{ accessToken: string }> {
        const existing = await this.userService.findOne({ username });
        if (existing) {
            throw new ConflictException('User already exists');
        }

        const { hashedPassword } = await hashPassword(password);
        if (!hashedPassword) {
            throw new InternalServerErrorException('Hashing failed');
        }

        const newUser = await this.userService.createUser({
            username,
            password: hashedPassword,
            email,
        });

        return { accessToken: await this.generateToken(newUser.id, newUser.username) };
    }

    async signIn(userName: string, pass: string): Promise<{ accessToken: string }> {
        const user = await this.userService.findOne({ username: userName });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const valid = await verifyPassword(user.password, pass);
        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return { accessToken: await this.generateToken(user.id, user.username) };
    }

    private generateToken(userId: number, username: string): Promise<string> {
        return this.jwtService.signAsync({ sub: userId, userName: username });
    }
}
