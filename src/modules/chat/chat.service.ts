import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ChatRepository } from './repository/chat.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatMapper } from './mappers/chat.mapper';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getOrCreateConversation(
    currentUserId: string,
    dto: CreateConversationDto,
  ) {
    const userBigIntId = BigInt(currentUserId);
    const tripBigIntId = BigInt(dto.tripId);
    const customerBigIntId = BigInt(dto.customerId);

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripBigIntId },
    });

    if (!trip) {
      throw new NotFoundException('Trip tidak ditemukan');
    }

    if (userBigIntId !== customerBigIntId && userBigIntId !== trip.mitraId) {
      throw new ForbiddenException(
        'Akses ditolak. Anda bukan partisipan dalam trip ini.',
      );
    }

    let conversation =
      await this.chatRepository.findConversationByTripAndCustomer(
        tripBigIntId,
        customerBigIntId,
      );

    if (!conversation) {
      conversation = await this.chatRepository.createConversation({
        tripId: tripBigIntId,
        customerId: customerBigIntId,
        mitraId: trip.mitraId,
      });
    }

    if (!conversation) {
      throw new NotFoundException('Gagal membuat atau menemukan percakapan');
    }

    const unreadCount = await this.chatRepository.countUnreadMessages(
      conversation.id,
      userBigIntId,
    );

    return ChatMapper.toConversationResponse({
      ...conversation,
      unreadCount,
    });
  }

  async getUserConversation(currentUserId: string) {
    const userBigIntId = BigInt(currentUserId);
    const conversation =
      await this.chatRepository.getUserConversations(userBigIntId);

    const mappedConversations = await Promise.all(
      conversation.map(async (conv) => {
        const undreadCount = await this.chatRepository.countUnreadMessages(
          conv.id,
          userBigIntId,
        );
        return ChatMapper.toConversationResponse({
          ...conv,
          undreadCount,
        });
      }),
    );

    return mappedConversations;
  }

  async sendMessage(
    currentUserId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    const userBigIntId = BigInt(currentUserId);
    const convBigIntId = BigInt(conversationId);

    const conversation =
      await this.chatRepository.findConversationById(convBigIntId);

    if (!conversation) {
      throw new NotFoundException('Percakapan tidak ditemukan');
    }

    if (
      conversation.customerId !== userBigIntId &&
      conversation.mitraId !== userBigIntId
    ) {
      throw new ForbiddenException(
        'Akses ditolak. Anda bukan anggota percakapan ini.',
      );
    }

    if (
      conversation.isLocked ||
      conversation.trip.status === 'completed' ||
      conversation.trip.status === 'cancelled'
    ) {
      if (!conversation.isLocked) {
        await this.chatRepository.lockConversation(convBigIntId);
      }
      throw new BadRequestException(
        'Percakapan telah dikunci karena trip telah selesai atau dibatalkan',
      );
    }

    const message = await this.chatRepository.createMessage({
      conversationId: convBigIntId,
      senderId: userBigIntId,
      messageText: dto.messageText,
    });

    return ChatMapper.toMessageResponse(message);
  }

  async getMessages(currentUserId: string, conversationId: string) {
    const userBigIntId = BigInt(currentUserId);
    const convBigIntId = BigInt(conversationId);

    const conversation =
      await this.chatRepository.findConversationById(convBigIntId);

    if (!conversation) {
      throw new NotFoundException('Percakapan tidak ditemukan.');
    }

    if (
      conversation.customerId !== userBigIntId &&
      conversation.mitraId !== userBigIntId
    ) {
      throw new ForbiddenException(
        'Akses ditolak. Anda bukan anggota percakapan ini',
      );
    }

    await this.chatRepository.markMessagesAsRead(convBigIntId, userBigIntId);
    const messages =
      await this.chatRepository.getMessagesByConversation(convBigIntId);
    return messages.map((msg) => ChatMapper.toMessageResponse(msg));
  }
}
