import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';

// 1. MOCK PRISMA SERVICE UNTUK MENCEGAH JEST PARSE ESM PRISMA CLIENT
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { WalletsRepository } from './repository/wallets.repository';

describe('WalletsService', () => {
  let walletsService: WalletsService;
  let walletRepository: jest.Mocked<WalletsRepository>;

  const mockWallet = {
    id: BigInt(1),
    userId: BigInt(10),
    balance: BigInt(500000),
    heldEscrowBalance: BigInt(100000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findByUserId: jest.fn(),
      createWallets: jest.fn(),
      processEscrowHold: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: WalletsRepository, useValue: mockRepo },
      ],
    }).compile();

    walletsService = module.get<WalletsService>(WalletsService);
    walletRepository = module.get(
      WalletsRepository,
    ) as jest.Mocked<WalletsRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(walletsService).toBeDefined();
  });

  describe('getMyWallet()', () => {
    it('harus mengembalikan data wallet mapped jika wallet sudah ada', async () => {
      walletRepository.findByUserId.mockResolvedValue(mockWallet as any);

      const result = await walletsService.getMyWallet('10');

      expect(walletRepository.findByUserId).toHaveBeenCalledWith(BigInt(10));
      expect(walletRepository.createWallets).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('harus membuat wallet baru jika wallet pengguna belum ada', async () => {
      walletRepository.findByUserId.mockResolvedValue(null);
      walletRepository.createWallets.mockResolvedValue(mockWallet as any);

      const result = await walletsService.getMyWallet('10');

      expect(walletRepository.findByUserId).toHaveBeenCalledWith(BigInt(10));
      expect(walletRepository.createWallets).toHaveBeenCalledWith(BigInt(10));
      expect(result).toBeDefined();
    });
  });

  describe('holdEscrow()', () => {
    it('harus memproses escrow hold pada wallet mitra yang sudah ada', async () => {
      walletRepository.findByUserId.mockResolvedValue(mockWallet as any);
      walletRepository.processEscrowHold.mockResolvedValue({} as any);

      await walletsService.holdEscrow('10', '100', 50000);

      expect(walletRepository.findByUserId).toHaveBeenCalledWith(BigInt(10));
      expect(walletRepository.createWallets).not.toHaveBeenCalled();
      expect(walletRepository.processEscrowHold).toHaveBeenCalledWith(
        mockWallet.id,
        BigInt(100),
        50000,
      );
    });

    it('harus membuat wallet terlebih dahulu jika mitra belum punya wallet lalu memproses escrow hold', async () => {
      walletRepository.findByUserId.mockResolvedValue(null);
      walletRepository.createWallets.mockResolvedValue(mockWallet as any);
      walletRepository.processEscrowHold.mockResolvedValue({} as any);

      await walletsService.holdEscrow('10', '100', 50000);

      expect(walletRepository.findByUserId).toHaveBeenCalledWith(BigInt(10));
      expect(walletRepository.createWallets).toHaveBeenCalledWith(BigInt(10));
      expect(walletRepository.processEscrowHold).toHaveBeenCalledWith(
        mockWallet.id,
        BigInt(100),
        50000,
      );
    });
  });
});
