import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';

jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: jest.Mocked<PaymentsService>;

  const mockUser = { id: '10', role: 'customer' };

  beforeEach(async () => {
    const mockPaymentsService = {
      checkoutPayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockPaymentsService }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get(PaymentsService) as jest.Mocked<PaymentsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkoutPayment()', () => {
    it('harus meneruskan req.user.id dan DTO ke paymentsService.checkoutPayment', async () => {
      const dto = { orderId: '100', paymentGateway: 'midtrans' };
      const mockResponse = {
        message: 'Pembayaran berhasil dikonfirmasi...',
        payment: {
          id: '1',
          transactionId: 'TRX-12345678',
          amount: 150000,
          status: 'success' as any,
        },
      };

      service.checkoutPayment.mockResolvedValue(mockResponse);

      const result = await controller.checkoutPayment(mockUser, dto);

      expect(service.checkoutPayment).toHaveBeenCalledWith('10', dto);
      expect(result).toEqual(mockResponse);
    });
  });
});
