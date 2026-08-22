import {
  describe,
  beforeEach,
  afterEach,
  it,
  expect,
  jest,
} from '@jest/globals';

// Mock Prisma Service agar terisolasi penuh
jest.mock('../../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({})),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CheckpointsService } from './checkpoints.service';
import { CheckpointsRepository } from './repository/checkpoints.repository';
import { OrderType, ScanType } from '../../generated/prisma/enums';

describe('CheckpointsService', () => {
  let service: CheckpointsService;
  let checkpointsRepository: jest.Mocked<CheckpointsRepository>;

  const mockOperatorUserId = '10';

  const mockTrip = {
    id: BigInt(100),
    mitraId: BigInt(20),
    originPointId: BigInt(1),
    destinationPointId: BigInt(2),
    qrCodeTrip: 'TRIP-QR-100',
  };

  const mockPassengerOrder = {
    id: BigInt(500),
    tripId: BigInt(100),
    type: OrderType.passenger,
    qrCodeTicket: 'TKT-QR-500',
    totalPrice: BigInt(150000),
    otpClaim: null,
  };

  const mockParcelOrder = {
    id: BigInt(501),
    tripId: BigInt(100),
    type: OrderType.parcel,
    qrCodeTicket: 'TKT-QR-501',
    totalPrice: BigInt(200000),
    otpClaim: '123456',
  };

  const mockCheckpointLog = {
    id: BigInt(1),
    tripId: BigInt(100),
    orderId: BigInt(500),
    posId: BigInt(1),
    operatorUserId: BigInt(10),
    scanType: ScanType.checkin_origin,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findTripByQr: jest.fn(),
      findOrderByQr: jest.fn(),
      processCheckinOrigin: jest.fn(),
      processCheckinDestinationAndReleaseEscrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckpointsService,
        { provide: CheckpointsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CheckpointsService>(CheckpointsService);
    checkpointsRepository = module.get(
      CheckpointsRepository,
    ) as jest.Mocked<CheckpointsRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scanCheckpoint() - Checkin Origin', () => {
    it('harus berhasil memproses Check-in Origin di Pos Asal yang sesuai', async () => {
      checkpointsRepository.findTripByQr.mockResolvedValue(mockTrip as any);
      checkpointsRepository.findOrderByQr.mockResolvedValue(
        mockPassengerOrder as any,
      );
      checkpointsRepository.processCheckinOrigin.mockResolvedValue(
        mockCheckpointLog as any,
      );

      const dto = {
        qrCodeTrip: 'TRIP-QR-100',
        qrCodeTicket: 'TKT-QR-500',
        posId: '1', // Sesuai originPointId (1)
        scanType: ScanType.checkin_origin,
        securitySealQr: 'SEAL-999',
      };

      const result = await service.scanCheckpoint(mockOperatorUserId, dto);

      expect(checkpointsRepository.findTripByQr).toHaveBeenCalledWith(
        'TRIP-QR-100',
      );
      expect(checkpointsRepository.findOrderByQr).toHaveBeenCalledWith(
        'TKT-QR-500',
      );
      expect(checkpointsRepository.processCheckinOrigin).toHaveBeenCalledWith(
        BigInt(100),
        BigInt(500),
        BigInt(1),
        BigInt(10),
        'SEAL-999',
      );
      expect(result.message).toContain('Check-in Pos Asal berhasil');
    });

    it('harus melempar BadRequestException jika Check-in Origin dilakukan di luar Pos Asal', async () => {
      checkpointsRepository.findTripByQr.mockResolvedValue(mockTrip as any);
      checkpointsRepository.findOrderByQr.mockResolvedValue(
        mockPassengerOrder as any,
      );

      const dto = {
        qrCodeTrip: 'TRIP-QR-100',
        qrCodeTicket: 'TKT-QR-500',
        posId: '99', // Beda dengan originPointId (1)
        scanType: ScanType.checkin_origin,
      };

      await expect(
        service.scanCheckpoint(mockOperatorUserId, dto),
      ).rejects.toThrow(BadRequestException);
      expect(checkpointsRepository.processCheckinOrigin).not.toHaveBeenCalled();
    });
  });

  describe('scanCheckpoint() - Checkin Destination & Escrow Release', () => {
    it('harus berhasil Check-in Destination dan mencairkan Escrow untuk Tiket Penumpang', async () => {
      checkpointsRepository.findTripByQr.mockResolvedValue(mockTrip as any);
      checkpointsRepository.findOrderByQr.mockResolvedValue(
        mockPassengerOrder as any,
      );
      checkpointsRepository.processCheckinDestinationAndReleaseEscrow.mockResolvedValue(
        { ...mockCheckpointLog, scanType: ScanType.checkin_destination } as any,
      );

      const dto = {
        qrCodeTrip: 'TRIP-QR-100',
        qrCodeTicket: 'TKT-QR-500',
        posId: '2', // Sesuai destinationPointId (2)
        scanType: ScanType.checkin_destination,
      };

      const result = await service.scanCheckpoint(mockOperatorUserId, dto);

      expect(
        checkpointsRepository.processCheckinDestinationAndReleaseEscrow,
      ).toHaveBeenCalledWith(
        BigInt(100),
        BigInt(500),
        BigInt(2),
        BigInt(10),
        BigInt(20), // Mitra ID
        150000, // Total Price Escrow Release
      );
      expect(result.message).toContain('Dana Escrow telah dicairkan');
    });

    it('harus berhasil Check-in Destination untuk Parcel jika OTP Klaim valid', async () => {
      checkpointsRepository.findTripByQr.mockResolvedValue(mockTrip as any);
      checkpointsRepository.findOrderByQr.mockResolvedValue(
        mockParcelOrder as any,
      );
      checkpointsRepository.processCheckinDestinationAndReleaseEscrow.mockResolvedValue(
        { ...mockCheckpointLog, scanType: ScanType.checkin_destination } as any,
      );

      const dto = {
        qrCodeTrip: 'TRIP-QR-100',
        qrCodeTicket: 'TKT-QR-501',
        posId: '2',
        scanType: ScanType.checkin_destination,
        otpClaim: '123456', // OTP Cocok
      };

      const result = await service.scanCheckpoint(mockOperatorUserId, dto);

      expect(
        checkpointsRepository.processCheckinDestinationAndReleaseEscrow,
      ).toHaveBeenCalledWith(
        BigInt(100),
        BigInt(501),
        BigInt(2),
        BigInt(10),
        BigInt(20),
        200000,
      );
      expect(result).toBeDefined();
    });

    it('harus melempar BadRequestException jika OTP Klaim Parcel tidak diisi', async () => {
      checkpointsRepository.findTripByQr.mockResolvedValue(mockTrip as any);
      checkpointsRepository.findOrderByQr.mockResolvedValue(
        mockParcelOrder as any,
      );

      const dto = {
        qrCodeTrip: 'TRIP-QR-100',
        qrCodeTicket: 'TKT-QR-501',
        posId: '2',
        scanType: ScanType.checkin_destination,
        // otpClaim kosong
      };

      await expect(
        service.scanCheckpoint(mockOperatorUserId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('harus melempar BadRequestException jika OTP Klaim Parcel salah', async () => {
      checkpointsRepository.findTripByQr.mockResolvedValue(mockTrip as any);
      checkpointsRepository.findOrderByQr.mockResolvedValue(
        mockParcelOrder as any,
      );

      const dto = {
        qrCodeTrip: 'TRIP-QR-100',
        qrCodeTicket: 'TKT-QR-501',
        posId: '2',
        scanType: ScanType.checkin_destination,
        otpClaim: '999999', // OTP Salah (seharusnya 123456)
      };

      await expect(
        service.scanCheckpoint(mockOperatorUserId, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('scanCheckpoint() - General Validation Exceptions', () => {
    it('harus melempar NotFoundException jika QR Trip tidak ditemukan', async () => {
      checkpointsRepository.findTripByQr.mockResolvedValue(null);

      const dto = {
        qrCodeTrip: 'INVALID-TRIP',
        qrCodeTicket: 'TKT-QR-500',
        posId: '1',
        scanType: ScanType.checkin_origin,
      };

      await expect(
        service.scanCheckpoint(mockOperatorUserId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('harus melempar NotFoundException jika QR Tiket tidak ditemukan', async () => {
      checkpointsRepository.findTripByQr.mockResolvedValue(mockTrip as any);
      checkpointsRepository.findOrderByQr.mockResolvedValue(null);

      const dto = {
        qrCodeTrip: 'TRIP-QR-100',
        qrCodeTicket: 'INVALID-TKT',
        posId: '1',
        scanType: ScanType.checkin_origin,
      };

      await expect(
        service.scanCheckpoint(mockOperatorUserId, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('harus melempar BadRequestException jika Tiket terdaftar di Trip yang berbeda', async () => {
      checkpointsRepository.findTripByQr.mockResolvedValue(mockTrip as any);

      const otherTripOrder = { ...mockPassengerOrder, tripId: BigInt(999) }; // Mismatch
      checkpointsRepository.findOrderByQr.mockResolvedValue(
        otherTripOrder as any,
      );

      const dto = {
        qrCodeTrip: 'TRIP-QR-100',
        qrCodeTicket: 'TKT-QR-500',
        posId: '1',
        scanType: ScanType.checkin_origin,
      };

      await expect(
        service.scanCheckpoint(mockOperatorUserId, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
