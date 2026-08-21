import { Injectable } from '@nestjs/common';
import { TrackingRepository } from './tracking.repository';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class TrackingService {
  constructor(private readonly trackingRepository: TrackingRepository) {}

  async saveLocation(dto: UpdateLocationDto) {
    const tripBigIntId = BigInt(dto.tripId);
    return this.trackingRepository.createTrackingLog(
      tripBigIntId,
      dto.latitude,
      dto.longtitude,
    );
  }

  async getTripHistory(tripId: string) {
    const tripBigIntId = BigInt(tripId);
    const logs =
      await this.trackingRepository.getRecentTrackingLogs(tripBigIntId);

    return logs.map((log) => ({
      id: log.id.toString(),
      tripId: log.tripId.toString(),
      latitude: Number(log.latitude),
      longitude: Number(log.longitude),
      recordedAt: log.recordedAt.toISOString(),
    }));
  }
}
