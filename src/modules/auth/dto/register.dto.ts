import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '../../../generated/prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Jhons' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'jhons@gmail.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '09876543221' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{9,15}$/, {
    message: 'Nomor telepon hanya boleh berisi angka!',
  })
  phone!: string;

  @ApiProperty({ example: 'Af^dfa1212daG' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ enum: Role, default: Role.customer })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
