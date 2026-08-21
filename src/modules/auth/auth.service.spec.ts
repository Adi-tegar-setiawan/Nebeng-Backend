import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';

// 1. MOCK SEBELUM IMPORT DEPENDENCY LAIN
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../users/repositories/user.repository');
jest.mock('../users/users.service');

// 2. MOCK BCRYPT LENGKAP
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/repositories/user.repository';
import { Role } from '../../generated/prisma/enums';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: BigInt(1),
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '08123456789',
    password: '$2b$10$e8.G7wQ.1gK9aX2sB1y3u.1A2B3C4D5E6F7G8H9I0J',
    pinHash: '$2b$10$e8.G7wQ.1gK9aX2sB1y3u.1A2B3C4D5E6F7G8H9I0J',
    role: Role.customer,
    status: 'active',
    statusVerification: 'unverified',
    regionId: BigInt(1),
    refreshToken: '$2b$10$e8.G7wQ.1gK9aX2sB1y3u.1A2B3C4D5E6F7G8H9I0J',
    avatar: null,
    rewardPoints: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserResponseDto = {
    id: '1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '08123456789',
    role: Role.customer,
    status: 'active',
    statusVerification: 'unverified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
    };

    const mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'JWT_EXPIRES_IN') return '15m';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    userRepository = module.get(UserRepository) as jest.Mocked<UserRepository>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register()', () => {
    it('harus memanggil usersService.create dan mengembalikan UserResponseDto', async () => {
      usersService.create.mockResolvedValue(mockUserResponseDto as any);

      const registerDto = {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        phone: '08123456789',
        password: 'password123',
        role: Role.customer,
      };

      const result = await authService.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockUserResponseDto);
    });
  });

  describe('login()', () => {
    it('harus berhasil mengembalikan Access Token, Refresh Token, dan User jika kredensial valid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      (bcrypt.hash as jest.Mock).mockResolvedValue(
        'hashed-refresh-token' as never,
      );
      jwtService.sign
        .mockReturnValueOnce('mock-access-token' as never)
        .mockReturnValueOnce('mock-refresh-token' as never);

      const result = await authService.login({
        email: 'budi@example.com',
        password: 'password123',
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'budi@example.com',
      );
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(result.user.email).toEqual('budi@example.com');
      expect(userRepository.updateRefreshToken).toHaveBeenCalledWith(
        '1',
        'hashed-refresh-token',
      );
    });

    it('harus melempar UnauthorizedException jika email tidak ditemukan', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'unknown@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('harus melempar UnauthorizedException jika password tidak cocok', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false as never);

      await expect(
        authService.login({
          email: 'budi@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('harus melempar UnauthorizedException jika status akun bukan active', async () => {
      const suspendedUser = { ...mockUser, status: 'suspended' };
      userRepository.findByEmail.mockResolvedValue(suspendedUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);

      await expect(
        authService.login({
          email: 'budi@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken()', () => {
    it('harus berhasil memperbarui pasangan token jika refresh token valid', async () => {
      jwtService.verify.mockReturnValue({ sub: '1' } as never);
      userRepository.findById.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true as never);
      jwtService.sign
        .mockReturnValueOnce('new-access-token' as never)
        .mockReturnValueOnce('new-refresh-token' as never);

      const result = await authService.refreshToken({
        refreshToken: 'valid-refresh-token',
      });

      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
    });

    it('harus melempar UnauthorizedException jika token expired', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Jwt expired');
      });

      await expect(
        authService.refreshToken({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout()', () => {
    it('harus menghapus refresh token di DB dan mengembalikan pesan sukses', async () => {
      userRepository.updateRefreshToken.mockResolvedValue({} as any);

      const result = await authService.logout('1');

      expect(userRepository.updateRefreshToken).toHaveBeenCalledWith('1', null);
      expect(result).toEqual({ message: 'Berhasil keluar dari aplikasi' });
    });
  });
});
