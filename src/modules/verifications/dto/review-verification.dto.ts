import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationStatus } from '../../../generated/prisma/enums';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewVerificationDto {
  @ApiProperty({
    enum: [VerificationStatus.approved, VerificationStatus.rejected],
    example: VerificationStatus.approved,
  })
  @IsEnum(VerificationStatus)
  @IsNotEmpty()
  status!: VerificationStatus;

  @ApiPropertyOptional({
    example: 'Foto Ktp Buram, silakan ulangi kembali',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
