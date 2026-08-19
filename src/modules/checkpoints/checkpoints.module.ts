import { Module } from '@nestjs/common';
import { CheckpointsController } from './checkpoints.controller';
import { CheckpointsService } from './checkpoints.service';
import { CheckpointsRepository } from './repository/checkpoints.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CheckpointsController],
  providers: [CheckpointsService, CheckpointsRepository],
  exports: [CheckpointsService, CheckpointsRepository],
})
export class CheckpointsModule {}
