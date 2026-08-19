import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorators';

@ApiTags('Wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletService: WalletsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Cek saldo & riwayat dompet digital milik sendiri' })
  async getMyWallet(@GetUser() user: any) {
    return this.walletService.getMyWallet(user.id);
  }
}
