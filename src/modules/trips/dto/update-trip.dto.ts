import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TripStatus } from '../../../generated/prisma/enums';

export class UpdateTripDto {
  @ApiPropertyOptional({ enum: TripStatus })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @ApiPropertyOptional({ example: '2026-08-25' })
  @IsOptional()
  @IsString()
  departureDate?: string;

  @ApiPropertyOptional({ example: '1970-01-01T09:00:00.000Z' })
  @IsOptional()
  @IsString()
  departureTime?: string;
}
