import { Module } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';
import { TrackingService } from './tracking.service';
import { TrackingRepository } from './tracking.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TrackingGateway, TrackingService, TrackingRepository],
  exports: [TrackingService],
})
export class TrackingModule {}
