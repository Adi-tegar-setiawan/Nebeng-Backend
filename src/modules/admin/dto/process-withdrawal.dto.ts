import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WithdrawalAction {
  APPROVE = 'approve',
  REJECT = 'reject',
}

export class ProcessWithdrawalDto {
  @ApiProperty({
    description: 'Tindakan persetujuan atau penolakan penarikan saldo',
    enum: WithdrawalAction,
    example: WithdrawalAction.APPROVE,
  })
  @IsNotEmpty({ message: 'action tidak boleh kosong' })
  @IsEnum(WithdrawalAction, {
    message: 'action harus bernilai approve atau reject',
  })
  action!: WithdrawalAction;

  @ApiProperty({
    description: 'Catatan admin atau alasan penolakan penarikan saldo',
    example: 'Transfer bank berhasil diproses via BNI',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'note harus berupa string' })
  note?: string;
}
