import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePickupPointDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  regionId?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  cityId?: string;

  @ApiPropertyOptional({ example: '2' })
  @IsOptional()
  operatorId?: string;

  @ApiPropertyOptional({ example: 'Pos Giwangan Baru' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Jl. Imogiri Timur No.10' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: -7.8333 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 110.3833 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
