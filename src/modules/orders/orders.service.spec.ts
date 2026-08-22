import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';

// Mock Prisma Service untuk isolasi penuh
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './repository/orders.repository';
import { TripsRepository } from '../trips/repository/trips.repository';
import {
  OrderType,
  TripStatus,
  OrderStatus,
} from '../../generated/prisma/enums';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: jest.Mocked<OrdersRepository>;
  let tripsRepository: jest.Mocked<TripsRepository>;

  const mockUser = { id: '10' };

  const mockTrip = {
    id: BigInt(100),
    mitraId: BigInt(20),
    price: BigInt(50000),
    seatAvailable: 4,
    remainingWeightCapacityKg: 20,
    status: TripStatus.scheduled,
  };

  const mockOrder = {
    id: BigInt(1),
    tripId: BigInt(100),
    customerId: BigInt(10),
    type: OrderType.passenger,
    status: OrderStatus.pending_payment,
    totalPrice: BigInt(100000),
    seatsBooked: 2,
    totalItemsCount: 0,
    totalWeightKg: 0,
    qrCodeTicket: 'TKT-ABC12345',
    otpClaim: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockOrdersRepo = {
      createOrderWithTransaction: jest.fn(),
      findByCustomerId: jest.fn(),
      findById: jest.fn(),
    };

    const mockTripsRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: mockOrdersRepo },
        { provide: TripsRepository, useValue: mockTripsRepo },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepository = module.get(
      OrdersRepository,
    ) as jest.Mocked<OrdersRepository>;
    tripsRepository = module.get(
      TripsRepository,
    ) as jest.Mocked<TripsRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder() - Passenger', () => {
    it('harus berhasil membuat order tiket penumpang jika sisa kursi mencukupi', async () => {
      tripsRepository.findById.mockResolvedValue(mockTrip as any);
      ordersRepository.createOrderWithTransaction.mockResolvedValue(
        mockOrder as any,
      );

      const dto = {
        tripId: '100',
        type: OrderType.passenger,
        seatsBooked: 2,
      };

      const result = await service.createOrder(mockUser.id, dto as any);

      expect(tripsRepository.findById).toHaveBeenCalledWith(BigInt(100));
      expect(ordersRepository.createOrderWithTransaction).toHaveBeenCalledWith(
        BigInt(100),
        BigInt(10),
        expect.objectContaining({
          type: OrderType.passenger,
          seatsBooked: 2,
          totalPrice: 100000,
          qrCodeTicket: expect.stringMatching(/^TKT-[A-F0-9]{8}$/),
          otpClaim: null,
        }),
        [],
        2,
        0,
      );
      expect(result).toBeDefined();
    });

    it('harus melempar BadRequestException jika kursi yang diminta melebihi sisa kursi', async () => {
      tripsRepository.findById.mockResolvedValue(mockTrip as any);

      const dto = {
        tripId: '100',
        type: OrderType.passenger,
        seatsBooked: 5,
      };

      await expect(
        service.createOrder(mockUser.id, dto as any),
      ).rejects.toThrow(BadRequestException);
      expect(
        ordersRepository.createOrderWithTransaction,
      ).not.toHaveBeenCalled();
    });
  });

  describe('createOrder() - Parcel', () => {
    it('harus berhasil membuat order pengiriman parcel jika kapasitas bagasi mencukupi', async () => {
      tripsRepository.findById.mockResolvedValue(mockTrip as any);

      const mockParcelOrder = {
        ...mockOrder,
        type: OrderType.parcel,
        totalPrice: BigInt(250000),
        totalWeightKg: 5,
        otpClaim: '123456',
      };

      ordersRepository.createOrderWithTransaction.mockResolvedValue(
        mockParcelOrder as any,
      );

      const dto = {
        tripId: '100',
        type: OrderType.parcel,
        items: [
          {
            itemName: 'Kardus Baju',
            itemCategory: 'Pakaian',
            sizeEnum: 'MEDIUM',
            recipientName: 'Budi',
            recipientPhone: '08123456789',
            weightPerItemKg: 2.5,
            quantity: 2,
          },
        ],
      };

      const result = await service.createOrder(mockUser.id, dto as any);

      expect(ordersRepository.createOrderWithTransaction).toHaveBeenCalledWith(
        BigInt(100),
        BigInt(10),
        expect.objectContaining({
          type: OrderType.parcel,
          totalItemsCount: 1,
          totalWeightKg: 5,
          totalPrice: 250000,
          otpClaim: expect.stringMatching(/^\d{6}$/),
        }),
        expect.arrayContaining([
          expect.objectContaining({
            itemName: 'Kardus Baju',
            totalItemWeightKg: 5,
          }),
        ]),
        0,
        5,
      );
      expect(result).toBeDefined();
    });

    it('harus melempar BadRequestException jika item parcel tidak diisi', async () => {
      tripsRepository.findById.mockResolvedValue(mockTrip as any);

      const dto = {
        tripId: '100',
        type: OrderType.parcel,
        items: [],
      };

      await expect(
        service.createOrder(mockUser.id, dto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('harus melempar BadRequestException jika total berat barang melebihi kapasitas sisa bagasi', async () => {
      tripsRepository.findById.mockResolvedValue(mockTrip as any);

      const dto = {
        tripId: '100',
        type: OrderType.parcel,
        items: [
          {
            itemName: 'Mesin Cuci',
            itemCategory: 'Elektronik',
            sizeEnum: 'LARGE',
            recipientName: 'Budi',
            recipientPhone: '08123456789',
            weightPerItemKg: 25,
            quantity: 1,
          },
        ],
      };

      await expect(
        service.createOrder(mockUser.id, dto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createOrder() - General Validations', () => {
    it('harus melempar NotFoundException jika Trip tidak ditemukan', async () => {
      tripsRepository.findById.mockResolvedValue(null);

      const dto = { tripId: '999', type: OrderType.passenger, seatsBooked: 1 };

      await expect(
        service.createOrder(mockUser.id, dto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('harus melempar BadRequestException jika status Trip bukan scheduled', async () => {
      const completedTrip = { ...mockTrip, status: TripStatus.completed };
      tripsRepository.findById.mockResolvedValue(completedTrip as any);

      const dto = { tripId: '100', type: OrderType.passenger, seatsBooked: 1 };

      await expect(
        service.createOrder(mockUser.id, dto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyOrders() & getOrderById()', () => {
    it('harus mengembalikan daftar riwayat order milik customer', async () => {
      ordersRepository.findByCustomerId.mockResolvedValue([mockOrder] as any);

      const result = await service.getMyOrders(mockUser.id);

      expect(ordersRepository.findByCustomerId).toHaveBeenCalledWith(
        BigInt(10),
      );
      expect(result).toHaveLength(1);
    });

    it('harus mengembalikan detail order jika ID ditemukan', async () => {
      ordersRepository.findById.mockResolvedValue(mockOrder as any);

      const result = await service.getOrderById('1');

      expect(ordersRepository.findById).toHaveBeenCalledWith(BigInt(1));
      expect(result).toBeDefined();
    });

    it('harus melempar NotFoundException jika order detail tidak ditemukan', async () => {
      ordersRepository.findById.mockResolvedValue(null);

      await expect(service.getOrderById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
