import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TripStatus, VehicleType } from '../../../generated/prisma/enums';

export class QueryTripDto {
  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsString()
  originPointId?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  destinationPointId?: string;

  @ApiPropertyOptional({ example: '2026-08-25' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @ApiPropertyOptional({ enum: TripStatus })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;
}
