import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SetPinDto {
  @ApiProperty({ example: '123456', description: 'PIN 6 digit angka' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{6}$/, { message: 'PIN harus terdiri dari 6 digit angka' })
  pin!: string;
}
