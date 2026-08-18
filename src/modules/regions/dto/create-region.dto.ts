import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRegionDto {
  @ApiProperty({ example: 'Wilayah Yogyakarta', description: 'nama Wilayah' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'REG-DIY', description: 'Kode unik wilayah' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
