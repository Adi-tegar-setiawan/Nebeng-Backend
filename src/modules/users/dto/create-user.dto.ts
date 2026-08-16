import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role, UserStatus } from '../../../generated/prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Jhons' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'jhons@gmail.com ' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '0812345678913' })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: Role, example: Role.customer })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsString()
  regionId?: string;

  @ApiPropertyOptional({ enum: UserStatus, default: UserStatus.active })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
