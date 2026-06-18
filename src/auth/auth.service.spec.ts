import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from 'src/Features/User/user.service';
import { RefreshTokenRepository } from './repository/refresh-token.repository';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn(),
                        createUser: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn().mockResolvedValue('token'),
                    },
                },
                {
                    provide: RefreshTokenRepository,
                    useValue: {
                        create: jest.fn(),
                        findValidByHash: jest.fn(),
                        revokeById: jest.fn(),
                        revokeByHash: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
