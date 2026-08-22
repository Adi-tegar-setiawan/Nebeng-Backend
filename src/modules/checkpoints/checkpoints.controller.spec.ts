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
import { CheckpointsController } from './checkpoints.controller';
import { CheckpointsService } from './checkpoints.service';
import { ScanType } from '../../generated/prisma/enums';

describe('CheckpointsController', () => {
  let controller: CheckpointsController;
  let service: jest.Mocked<CheckpointsService>;

  const mockUser = { id: '10', role: 'operator_pos' };

  beforeEach(async () => {
    const mockCheckpointsService = {
      scanCheckpoint: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckpointsController],
      providers: [
        { provide: CheckpointsService, useValue: mockCheckpointsService },
      ],
    }).compile();

    controller = module.get<CheckpointsController>(CheckpointsController);
    service = module.get(CheckpointsService) as jest.Mocked<CheckpointsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('scanCheckpoint()', () => {
    it('harus meneruskan operator ID dan DTO scan ke checkpointsService.scanCheckpoint', async () => {
      const dto = {
        qrCodeTrip: 'TRIP-QR-100',
        qrCodeTicket: 'TKT-QR-500',
        posId: '1',
        scanType: ScanType.checkin_origin,
      };

      const mockResponse = {
        message: 'Check-in Pos Asal berhasil...',
        checkpoint: { id: '1', scanType: ScanType.checkin_origin },
      };

      service.scanCheckpoint.mockResolvedValue(mockResponse as any);

      const result = await controller.scanCheckpoint(mockUser, dto);

      expect(service.scanCheckpoint).toHaveBeenCalledWith('10', dto);
      expect(result).toEqual(mockResponse);
    });
  });
});
