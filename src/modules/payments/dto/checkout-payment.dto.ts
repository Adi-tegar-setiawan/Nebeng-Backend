import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CheckoutPaymentDto {
  @ApiProperty({ example: '1', description: 'ID order yang akan dibayar' })
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @ApiProperty({ example: ' BANK_TRANSFER / QRIS / MANUAL_SIMULATION' })
  @IsString()
  @IsNotEmpty()
  paymentGateway!: string;
}
