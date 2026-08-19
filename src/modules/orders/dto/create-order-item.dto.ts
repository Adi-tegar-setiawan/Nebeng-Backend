import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ParcelSize } from '../../../generated/prisma/enums';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'Dokumen Penting' })
  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @ApiProperty({ example: 'Dokumen' })
  @IsString()
  @IsNotEmpty()
  itemCategory!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 2.5, description: 'Berat per item dalam KG' })
  @IsNumber()
  @Min(0.1)
  weightPerItemKg!: number;

  @ApiProperty({ enum: ParcelSize, example: ParcelSize.s })
  @IsEnum(ParcelSize)
  sizeEnum!: ParcelSize;

  @ApiPropertyOptional({ example: 'https://storage.nebeng.com/item1.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ example: 'Budi Santoso', description: 'Nama penerima paket' })
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @ApiProperty({
    example: '081234567890',
    description: 'Nomor HP penerima paket',
  })
  @IsString()
  @IsNotEmpty()
  recipientPhone!: string;
}
