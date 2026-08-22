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
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderType } from '../../generated/prisma/enums';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: jest.Mocked<OrdersService>;

  const mockUser = { id: '10', role: 'customer' };

  beforeEach(async () => {
    const mockOrdersService = {
      createOrder: jest.fn(),
      getMyOrders: jest.fn(),
      getOrderById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockOrdersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get(OrdersService) as jest.Mocked<OrdersService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder()', () => {
    it('harus meneruskan customer ID dan DTO ke ordersService.createOrder', async () => {
      const dto = { tripId: '100', type: OrderType.passenger, seatsBooked: 1 };
      const mockResponse = { id: '1', totalPrice: 50000 };

      service.createOrder.mockResolvedValue(mockResponse as any);

      const result = await controller.createOrder(mockUser, dto);

      expect(service.createOrder).toHaveBeenCalledWith('10', dto);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getMyOrders()', () => {
    it('harus memanggil ordersService.getMyOrders dengan ID user aktif', async () => {
      service.getMyOrders.mockResolvedValue([] as any);

      const result = await controller.getMyOrders(mockUser);

      expect(service.getMyOrders).toHaveBeenCalledWith('10');
      expect(result).toEqual([]);
    });
  });

  describe('getOrderById()', () => {
    it('harus memanggil ordersService.getOrderById dengan ID parameter', async () => {
      const mockResponse = { id: '1', totalPrice: 50000 };
      service.getOrderById.mockResolvedValue(mockResponse as any);

      const result = await controller.getOrderById('1');

      expect(service.getOrderById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockResponse);
    });
  });
});
