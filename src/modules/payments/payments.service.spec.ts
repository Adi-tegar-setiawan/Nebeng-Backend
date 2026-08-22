import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';

// Mock Prisma Service agar tidak membaca ESM Prisma Client saat pengujian
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './repository/payments.repository';
import { OrdersRepository } from '../orders/repository/orders.repository';
import { WalletsService } from '../wallets/wallets.service';
import { OrderStatus, PaymentStatus } from '../../generated/prisma/enums';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepository: jest.Mocked<PaymentsRepository>;
  let ordersRepository: jest.Mocked<OrdersRepository>;
  let walletsService: jest.Mocked<WalletsService>;

  const mockUser = { id: '10' };

  const mockOrder = {
    id: BigInt(100),
    customerId: BigInt(10),
    totalPrice: BigInt(150000),
    status: OrderStatus.pending_payment,
    trip: {
      mitraId: BigInt(20),
    },
  };

  const mockCreatedPayment = {
    id: BigInt(1),
    orderId: BigInt(100),
    paymentGateway: 'midtrans',
    transactionId: 'TRX-ABC12345',
    amount: BigInt(150000),
    status: PaymentStatus.success,
  };

  beforeEach(async () => {
    const mockPaymentsRepo = {
      createPaymentAndUpdateOrder: jest.fn(),
    };

    const mockOrdersRepo = {
      findById: jest.fn(),
    };

    const mockWalletsServ = {
      holdEscrow: jest.fn(),
      getMyWallet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: mockPaymentsRepo },
        { provide: OrdersRepository, useValue: mockOrdersRepo },
        { provide: WalletsService, useValue: mockWalletsServ },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentsRepository = module.get(
      PaymentsRepository,
    ) as jest.Mocked<PaymentsRepository>;
    ordersRepository = module.get(
      OrdersRepository,
    ) as jest.Mocked<OrdersRepository>;
    walletsService = module.get(WalletsService) as jest.Mocked<WalletsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkoutPayment()', () => {
    it('harus berhasil memproses checkout payment dan menahan dana di escrow', async () => {
      ordersRepository.findById.mockResolvedValue(mockOrder as any);
      paymentsRepository.createPaymentAndUpdateOrder.mockResolvedValue({
        payment: mockCreatedPayment as any,
        order: mockOrder as any,
      });
      walletsService.holdEscrow.mockResolvedValue(undefined as any);

      const dto = { orderId: '100', paymentGateway: 'midtrans' };
      const result = await service.checkoutPayment(mockUser.id, dto);

      expect(ordersRepository.findById).toHaveBeenCalledWith(BigInt(100));
      expect(
        paymentsRepository.createPaymentAndUpdateOrder,
      ).toHaveBeenCalledWith(
        BigInt(100),
        'midtrans',
        expect.stringMatching(/^TRX-[A-F0-9]{8}$/),
        150000,
      );
      expect(walletsService.holdEscrow).toHaveBeenCalledWith(
        '20', // Mitra User ID
        '100', // Order ID
        150000, // Amount
      );
      expect(result).toHaveProperty('message');
      expect(result.payment.id).toEqual('1');
      expect(result.payment.amount).toEqual(150000);
    });

    it('harus melempar NotFoundException jika order tidak ditemukan', async () => {
      ordersRepository.findById.mockResolvedValue(null);

      const dto = { orderId: '999', paymentGateway: 'midtrans' };

      await expect(service.checkoutPayment(mockUser.id, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        paymentsRepository.createPaymentAndUpdateOrder,
      ).not.toHaveBeenCalled();
      expect(walletsService.holdEscrow).not.toHaveBeenCalled();
    });

    it('harus melempar BadRequestException jika order milik user lain', async () => {
      ordersRepository.findById.mockResolvedValue(mockOrder as any);

      const dto = { orderId: '100', paymentGateway: 'midtrans' };
      const otherUserId = '999';

      await expect(service.checkoutPayment(otherUserId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(
        paymentsRepository.createPaymentAndUpdateOrder,
      ).not.toHaveBeenCalled();
    });

    it('harus melempar BadRequestException jika status order bukan pending_payment', async () => {
      const paidOrder = { ...mockOrder, status: OrderStatus.paid };
      ordersRepository.findById.mockResolvedValue(paidOrder as any);

      const dto = { orderId: '100', paymentGateway: 'midtrans' };

      await expect(service.checkoutPayment(mockUser.id, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(
        paymentsRepository.createPaymentAndUpdateOrder,
      ).not.toHaveBeenCalled();
    });
  });
});
