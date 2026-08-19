import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckpointsService } from './checkpoints.service';
import { ScanCheckpointDto } from './dto/scan-checkpoint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorators';

@ApiTags('Checkpoints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('checkpoints')
export class CheckpointsController {
  constructor(private readonly checkpointsService: CheckpointsService) {}

  @Post('scan')
  @Roles('operator_pos', 'admin_wilayah', 'superadmin')
  @ApiOperation({
    summary: 'Scan Dual QR Check-in Pos Asal / Pos Tujuan (Operator Pos Only)',
  })
  async scanCheckpoint(@GetUser() user: any, @Body() dto: ScanCheckpointDto) {
    return this.checkpointsService.scanCheckpoint(user.id, dto);
  }
}
