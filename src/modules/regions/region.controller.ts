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
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { CreateCityDto } from './dto/create-city.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';

@ApiTags('Regions & Cities')
@Controller()
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  // --- REGIONS ENDPOINTS ---
  @Post('regions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah Region Baru (Superadmin Only)' })
  async createRegion(@Body() dto: CreateRegionDto) {
    return this.regionService.createRegion(dto);
  }

  @Get('regions')
  @ApiOperation({
    summary: 'Melihat seluruh daftar Region (Public/Authenticated)',
  })
  @ApiQuery({ name: 'onlyActive', type: Boolean, required: false })
  async findAllRegions(@Query('onlyActive') onlyActive?: string) {
    const isActive = onlyActive === 'true';
    return this.regionService.getAllRegions(isActive);
  }

  @Get('regions/:id')
  @ApiOperation({ summary: 'Melihat detail Region berdasarkan ID' })
  async findOneRegion(@Param('id') id: string) {
    return this.regionService.getRegionById(id);
  }

  @Patch('regions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superadmin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update/Deaktivasi Region (Superadmin Only)' })
  async updateRegion(@Param('id') id: string, @Body() dto: UpdateRegionDto) {
    return this.regionService.updateRegion(id, dto);
  }

  // --- CITIES ENDPOINTS ---
  @Post('cities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.superadmin, Role.admin_wilayah)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tambah Kota Baru (Superadmin & Admin Wilayah)' })
  async createCity(@Body() dto: CreateCityDto) {
    return this.regionService.createCity(dto);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Melihat seluruh daftar Kota' })
  async findAllCities() {
    return this.regionService.getAllCities();
  }
}
