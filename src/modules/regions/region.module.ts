import { Module } from '@nestjs/common';
import { RegionController } from './region.controller';
import { RegionService } from './region.service';
import { RegionRepository } from './repositories/region.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RegionController],
  providers: [RegionService, RegionRepository],
  exports: [RegionService, RegionRepository],
})
export class RegionsModule {}
