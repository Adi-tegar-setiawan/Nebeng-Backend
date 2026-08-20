import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'ID Trip tempat percakapan dibuat',
    example: '12',
  })
  @IsNotEmpty({ message: 'tripId tidak boleh kosong' })
  @IsString({ message: 'tripId harus berupa string' })
  tripId!: string;

  @ApiProperty({
    description: 'ID customer yang memulai percakapan',
    example: '5',
  })
  @IsNotEmpty({ message: 'customerId tidak boleh kosong' })
  @IsString({ message: 'customerId harus berupa string' })
  customerId!: string;
}
