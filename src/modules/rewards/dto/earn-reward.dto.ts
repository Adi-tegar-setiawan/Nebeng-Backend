import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EarnRewardDto {
  @ApiProperty({
    description: 'ID user penerima point',
    example: '5',
  })
  @IsNotEmpty({ message: 'userId tidak boleh kosong' })
  @IsString({ message: 'userId harus berupa string' })
  userId!: string;

  @ApiProperty({
    description: 'jumlah point yang ditambahkan',
    example: 100,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'points tidak boleh kosong' })
  @IsInt({ message: 'points harus berupa angka bulat' })
  @Min(1, { message: 'points minimal 1' })
  points!: number;

  @ApiProperty({
    description: 'keterangan sumber penamabahn point',
    example: 'Selesai transaksi nebeng penumpang #TRIP-13NA',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'description harus berupa string' })
  description?: string;
}
