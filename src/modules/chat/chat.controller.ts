import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({
    summary: 'Mulai atau ambil percakapan antara customer dan mitra.',
  })
  @Post('conversation')
  async createConversation(
    @Request() req: any,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(req.user.id, dto);
  }

  @ApiOperation({
    summary: 'Daftar semua percakapan milik user yang sedang login',
  })
  @Get('conversation')
  async getUserConversations(@Request() req: any) {
    return this.chatService.getUserConversation(req.user.id);
  }

  @ApiOperation({ summary: 'Kirim pesan ke dalam percakapan' })
  @Post('conversation/:id/messages')
  async sendMessage(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(req.user.id, conversationId, dto);
  }

  @ApiOperation({
    summary: 'Ambil semua pesan dalam percakapan',
  })
  @Get('conversations/:id/messages')
  async getMessages(@Request() req: any, @Param('id') conversationId: string) {
    return this.chatService.getMessages(req.user.id, conversationId);
  }
}
