import { Module } from '@nestjs/common';
import { PickupPointController } from './pickup-point.controller';
import { PickupPointService } from './pickup-point.service';
import { PickupPointRepository } from './repository/pickup-point.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PickupPointController],
  providers: [PickupPointService, PickupPointRepository],
  exports: [PickupPointService, PickupPointRepository],
})
export class PickupPointsModule {}
