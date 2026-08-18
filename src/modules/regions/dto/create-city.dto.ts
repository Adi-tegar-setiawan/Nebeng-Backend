import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ example: 'Sleman', description: 'Nama kota/kabupaten' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'DI Yogyakarta', description: 'Nama Provinsi' })
  @IsString()
  @IsNotEmpty()
  province!: string;
}
