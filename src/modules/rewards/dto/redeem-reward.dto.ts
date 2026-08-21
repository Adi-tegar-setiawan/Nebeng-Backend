import { IsNotEmpty, IsInt, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedeemRewardDto {
  @ApiProperty({
    description: 'Jumlah poin yang ingin ditukarkan',
    example: 50,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'points tidak boleh kosong' })
  @IsInt({ message: 'Point harus berupa angka bulat' })
  @Min(1, { message: 'Point minimal adalah 1' })
  points!: number;

  @ApiProperty({
    description: 'keterangan penukaran point',
    example: 'Penukaran merchendase',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'description harus berupa string' })
  description?: string;
}
