import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';

// MOCK DEPENDENSI AGAR JEST TIDAK PARSE GENERATED PRISMA CLIENT
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('../users/repositories/user.repository');
jest.mock('../users/users.service');
jest.mock('./auth.service');

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '../../generated/prisma/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

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

  const mockLoginResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: mockUserResponseDto as any,
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('harus memanggil authService.register dan mengembalikan UserResponseDto', async () => {
      const registerDto = {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        phone: '08123456789',
        password: 'password123',
        role: Role.customer,
      };

      authService.register.mockResolvedValue(mockUserResponseDto as any);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockUserResponseDto);
    });
  });

  describe('POST /auth/login', () => {
    it('harus memanggil authService.login dan mengembalikan token serta data user', async () => {
      const loginDto = {
        email: 'budi@example.com',
        password: 'password123',
      };

      authService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('GET /auth/me', () => {
    it('harus mengembalikan data pengguna dari req.user', () => {
      const req = { user: mockUserResponseDto };

      const result = controller.getProfile(req);

      expect(result).toEqual(mockUserResponseDto);
    });
  });

  describe('POST /auth/refresh', () => {
    it('harus memanggil authService.refreshToken dengan RefreshTokenDto', async () => {
      const refreshTokenDto = { refreshToken: 'mock-refresh-token' };
      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      authService.refreshToken.mockResolvedValue(tokens);

      const result = await controller.refresh(refreshTokenDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toEqual(tokens);
    });
  });

  describe('POST /auth/logout', () => {
    it('harus memanggil authService.logout dengan ID user dari req.user.id', async () => {
      const req = { user: { id: '1' } };
      const logoutResponse = { message: 'Berhasil keluar dari aplikasi' };

      authService.logout.mockResolvedValue(logoutResponse);

      const result = await controller.logout(req);

      expect(authService.logout).toHaveBeenCalledWith('1');
      expect(result).toEqual(logoutResponse);
    });
  });
});
