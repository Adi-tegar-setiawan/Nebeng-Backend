import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RewardType } from '../../../generated/prisma/enums';

@Injectable()
export class RewardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(userId: bigint) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async addRewardPoints(data: {
    userId: bigint;
    points: number;
    description?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: data.userId },
        data: {
          rewardPoints: { increment: data.points },
        },
      });

      const transaction = await tx.rewardTransaction.create({
        data: {
          userId: data.userId,
          points: data.points,
          type: RewardType.earn,
          description: data.description,
        },
        include: { user: true },
      });

      return { user: updatedUser, transaction };
    });
  }

  async deductRewardPoints(data: {
    userId: bigint;
    points: number;
    description?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: data.userId },
        data: {
          rewardPoints: { decrement: data.points },
        },
      });

      const transaction = await tx.rewardTransaction.create({
        data: {
          userId: data.userId,
          points: data.points,
          type: RewardType.redeem,
          description: data.description,
        },
        include: { user: true },
      });
      return { user: updatedUser, transaction };
    });
  }

  async getRewardHistoryByUserId(userId: bigint) {
    return this.prisma.rewardTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
