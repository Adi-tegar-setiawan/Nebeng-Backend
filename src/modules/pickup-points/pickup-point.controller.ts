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
import { PickupPointService } from './pickup-point.service';
import { CreatePickupPointDto } from './dto/create-pickup-point.dto';
import { UpdatePickupPointDto } from './dto/update-pickup-point.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';

@ApiTags('Pickup Points (Pos Resmi)')
@Controller('pickup-points')
export class PickupPointController {
  constructor(private readonly pickupPointService: PickupPointService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superadmin, Role.admin_wilayah)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tambah Pickup Point / Pos Resmi Baru (Admin/Superadmin)',
  })
  async create(@Body() dto: CreatePickupPointDto) {
    return this.pickupPointService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Melihat seluruh Pos Resmi' })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiQuery({ name: 'cityId', required: false })
  @ApiQuery({ name: 'onlyActive', type: Boolean, required: false })
  async findAll(
    @Query('regionId') regionId?: string,
    @Query('cityId') cityId?: string,
    @Query('onlyActive') onlyActive?: string,
  ) {
    const isActive = onlyActive === 'true';
    return this.pickupPointService.findAll(regionId, cityId, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Melihat detail Pos Resmi berdasarkan ID' })
  async findOne(@Param('id') id: string) {
    return this.pickupPointService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superadmin, Role.admin_wilayah)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update/Deaktivasi Pos Resmi (Admin/Superadmin)' })
  async update(@Param('id') id: string, @Body() dto: UpdatePickupPointDto) {
    return this.pickupPointService.update(id, dto);
  }
}
