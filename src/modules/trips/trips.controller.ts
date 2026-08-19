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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { QueryTripDto } from './dto/query-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorators';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mitra')
  @ApiOperation({ summary: 'Buat jadwal Trip baru (Mitra Only)' })
  async createTrip(@GetUser() user: any, @Body() dto: CreateTripDto) {
    return this.tripsService.createTrip(user.id, user.statusVerification, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Pencarian & Listing Trip (Publik / Customer)' })
  async getTrips(@Query() query: QueryTripDto) {
    return this.tripsService.getTrips(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail Trip berdasarkan ID' })
  async getTripById(@Param('id') id: string) {
    return this.tripsService.getTripById(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('mitra')
  @ApiOperation({ summary: 'Update detail / status Trip (Mitra Owner Only)' })
  async updateTrip(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() dto: UpdateTripDto,
  ) {
    return this.tripsService.updateTrip(id, user.id, dto);
  }
}
