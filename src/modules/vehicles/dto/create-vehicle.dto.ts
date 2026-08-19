import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { VehicleType } from '../../../generated/prisma/enums';

export class CreateVehicleDto {
  @ApiProperty({ enum: VehicleType, example: VehicleType.motor })
  @IsEnum(VehicleType, { message: 'Type harus berupa motor atau mobil' })
  type!: VehicleType;

  @ApiProperty({ example: 'Matic' })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({ example: 'AD 1234 ABC' })
  @IsString()
  @IsNotEmpty()
  plateNumber!: string;

  @ApiProperty({ example: 'Hitam' })
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ApiProperty({ example: 4, description: 'Kapasitas kursi penumpang' })
  @IsNumber()
  @Min(1, { message: 'Kapasitas kursi minimal 1' })
  capacitySeats!: number;

  @ApiProperty({ example: 50.0, description: 'Batas Max berat bagasi (kg)' })
  @IsNumber()
  @Min(0)
  maxWeightCapacityKg!: number;
}
