import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../../generated/prisma/enums';

export class UpdateUserGovernanceDto {
  @ApiProperty({
    description: 'Status akun baru (active, suspended, blocked)',
    enum: UserStatus,
    example: UserStatus.suspended,
  })
  @IsNotEmpty({ message: 'Status tidak boleh kosong' })
  @IsEnum(UserStatus, {
    message: 'Status harus berupa active, suspended, atau blocked',
  })
  status!: UserStatus;

  @ApiProperty({
    description: 'Alasan penanguhan atau pemblokiran akun',
    example: 'Pelanggaran ketetapan keamanan dan indikasi fraud',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'harus berupa string' })
  reason?: string;
}
