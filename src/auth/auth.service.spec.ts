import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── REGISTER ───────────────────────────────────────────────
  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-id-123',
        email: 'test@test.com',
        role: 'VIEWER',
      });

      const result = await authService.register({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual({
        message: 'User registered successfully',
        userId: 'user-id-123',
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@test.com',
      });

      await expect(
        authService.register({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ─── LOGIN ───────────────────────────────────────────────────
  describe('login', () => {
    it('should login successfully and return token', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id-123',
        email: 'test@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual({
        access_token: 'mock-token',
        role: 'ADMIN',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'wrong@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id-123',
        email: 'test@test.com',
        password: hashedPassword,
        status: 'ACTIVE',
      });

      await expect(
        authService.login({
          email: 'test@test.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is INACTIVE', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id-123',
        email: 'test@test.com',
        password: 'hashedpassword',
        status: 'INACTIVE',
      });

      await expect(
        authService.login({
          email: 'test@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});