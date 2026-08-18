import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { SumbitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, VerificationStatus } from '../generated/prisma/enums';
import { GetUser } from '../common/decorators/get-user.decorators';

@ApiTags('Verifications')
@Controller('verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('submit')
  @Roles(Role.customer, Role.mitra)
  @ApiOperation({ summary: 'Submit dokumen verifikasi' })
  async submit(
    @GetUser('id') userId: string,
    @Body() dto: SumbitVerificationDto,
  ) {
    return this.verificationService.sumbitVerification(userId, dto);
  }

  @Get()
  @Roles(Role.superadmin, Role.admin_wilayah)
  @ApiOperation({ summary: 'Melihat seluruh daftar verifikasi' })
  @ApiQuery({ name: 'status', enum: VerificationStatus, required: false })
  async findAll(@Query('status') status?: VerificationStatus) {
    return this.verificationService.getAllVerifications(status);
  }

  @Get(':id')
  @Roles(Role.superadmin, Role.admin_wilayah, Role.mitra, Role.customer)
  @ApiOperation({ summary: 'Melihat detail verifikasi berdasarkan id' })
  async findOne(@Param('id') id: string) {
    return this.verificationService.getVerificationById(id);
  }

  @Patch(':id/review')
  @Roles(Role.superadmin, Role.admin_wilayah)
  @ApiOperation({ summary: 'Approve atau Rejected dokumen verifikasi' })
  async review(
    @Param('id') id: string,
    @GetUser('id') adminId: string,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.verificationService.reviewVerification(id, adminId, dto);
  }
}
