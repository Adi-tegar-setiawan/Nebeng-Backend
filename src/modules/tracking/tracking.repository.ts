import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrackingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTrackingLog(tripId: bigint, latitude: number, longitude: number) {
    return this.prisma.tripTracking.create({
      data: {
        tripId,
        latitude,
        longitude,
      },
    });
  }

  async getRecentTrackingLogs(tripId: bigint, limit = 50) {
    return this.prisma.tripTracking.findMany({
      where: { tripId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  }
}
