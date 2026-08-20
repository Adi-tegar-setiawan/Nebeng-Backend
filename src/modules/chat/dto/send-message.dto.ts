import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Isi teks pesan singkat',
    example: 'Hallo mas, saya sudah sampai di Pos Asal ya.',
  })
  @IsNotEmpty({ message: 'Teks pesan tidak boleh kosong.' })
  @IsString({ message: 'Teks pesan harus berupa string' })
  messageText!: string;
}
