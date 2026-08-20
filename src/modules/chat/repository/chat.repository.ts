import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findConversationByTripAndCustomer(tripId: bigint, customerId: bigint) {
    return this.prisma.conversation.findFirst({
      where: {
        tripId,
        customerId,
      },
      include: {
        trip: true,
        customer: true,
        mitra: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async createConversation(data: {
    tripId: bigint;
    customerId: bigint;
    mitraId: bigint;
  }) {
    return this.prisma.conversation.create({
      data: {
        tripId: data.tripId,
        customerId: data.customerId,
        mitraId: data.mitraId,
        isLocked: false,
      },
      include: {
        trip: true,
        customer: true,
        mitra: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getUserConversations(userId: bigint) {
    return this.prisma.conversation.findMany({
      where: {
        OR: [{ customerId: userId }, { mitraId: userId }],
      },
      include: {
        trip: true,
        customer: true,
        mitra: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findConversationById(id: bigint) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        trip: true,
        customer: true,
        mitra: true,
      },
    });
  }

  async createMessage(data: {
    conversationId: bigint;
    senderId: bigint;
    messageText: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          messageText: data.messageText,
        },
        include: {
          sender: true,
        },
      });

      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    });
  }

  async getMessagesByConversation(conversationId: bigint) {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markMessagesAsRead(conversationId: bigint, userId: bigint) {
    return this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  async countUnreadMessages(
    conversationId: bigint,
    userId: bigint,
  ): Promise<number> {
    return this.prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
    });
  }

  async lockConversation(conversationId: bigint) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { isLocked: true },
    });
  }
}
