import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionType } from '../../../generated/prisma/enums';

@Injectable()
export class WalletsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: bigint) {
    return this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  async createWallets(userId: bigint) {
    return this.prisma.wallet.create({
      data: {
        userId,
        balance: 0.0,
        heldEscrowBalance: 0.0,
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  async processEscrowHold(walletId: bigint, orderId: bigint, amount: number) {
    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.update({
        where: { id: walletId },
        data: {
          heldEscrowBalance: { increment: amount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId,
          orderId,
          amount,
          type: TransactionType.escrow_hold,
          description: `Escrow hold untuk order ${orderId}`,
        },
      });

      return wallet;
    });
  }
}
