import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UpdateUserGovernanceDto } from './dto/update-user-governance.dto';

@ApiTags('Admin Governance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Dashboard Analytics Global (Superadmin)' })
  @Roles('superadmin')
  @Get('dashboard/global')
  async getGlobalDashboard() {
    return this.adminService.getGlobalDashboard();
  }

  @ApiOperation({
    summary: 'Dashboard Analytics Wilayah (Admin Wilayah / Superadmin)',
  })
  @Roles('superadmin', 'admin_wilayah')
  @ApiQuery({
    name: 'regionId',
    required: false,
    description: 'Diperlukan jika diakses oleh superadmin',
  })
  @Get('dashboard/regional')
  async getRegionalDashboard(
    @Request() req: any,
    @Query('regionId') regionId?: string,
  ) {
    return this.adminService.getRegionalDashboard(req.user, regionId);
  }

  @ApiOperation({
    summary: 'Laporan Audit Ledger & Escrow System (Superadmin)',
  })
  @Roles('superadmin')
  @Get('reports/escrow-ledger')
  async getEscrowLedger() {
    return this.adminService.getEscrowLedger();
  }

  @ApiOperation({
    summary: 'Super-Override Status Pengguna (Block/Suspend/Unblock)',
  })
  @Roles('superadmin')
  @Patch('users/:userId/status')
  async updateUserGovernance(
    @Request() req: any,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateUserGovernanceDto,
  ) {
    return this.adminService.updateUserGovernance(
      req.user.id,
      targetUserId,
      dto,
    );
  }
}
