import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehicleService } from './vehicles.service';
import { VehiclesRepository } from './repository/vehicles.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VehiclesController],
  providers: [VehicleService, VehiclesRepository],
  exports: [VehicleService, VehiclesRepository],
})
export class VehiclesModule {}
