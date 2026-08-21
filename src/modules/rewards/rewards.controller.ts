import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { EarnRewardDto } from './dto/earn-reward.dto';
import { RedeemRewardDto } from './dto/redeem-reward.dto';
import { RewardsService } from './rewards.service';

@ApiTags('Rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @ApiOperation({
    summary: 'Tambah point reward ke user (Superadmin / Admin wilayah)',
  })
  @Roles('superadmin', 'admin_wilayah')
  @Post('earn')
  async earnPoints(@Body() dto: EarnRewardDto) {
    return this.rewardsService.earnPoints(dto);
  }

  @ApiOperation({ summary: 'Tukarkan poin reward (Customer / Mitra)' })
  @Post('redeem')
  async redeemPoints(@Request() req: any, @Body() dto: RedeemRewardDto) {
    return this.rewardsService.reedemPoints(req.user.id, dto);
  }

  @ApiOperation({ summary: 'cek saldo poin dan riwayat transaksi poin user' })
  @Get('me')
  async getMyRewardSummary(@Request() req: any) {
    return this.rewardsService.getUserRewardSummary(req.user.id);
  }
}
