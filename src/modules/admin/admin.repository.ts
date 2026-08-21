import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserStatus, TransactionType } from '../../generated/prisma/enums';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalAnalytics() {
    const [
      totalPaidOrders,
      activeTripsCount,
      totalTransactionsCount,
      regionalSummary,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          status: {
            in: ['paid', 'completed', 'in_transit', 'arrived_destination'],
          },
        },
        _sum: { totalPrice: true },
      }),
      this.prisma.trip.count({
        where: { status: { in: ['scheduled', 'in_origin_pos', 'in_transit'] } },
      }),
      this.prisma.order.count(),
      this.prisma.region.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              pickupPoints: true,
              users: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = Number(totalPaidOrders._sum.totalPrice || 0);
    const platformCommission = totalRevenue * 0.1;

    return {
      totalRevenue,
      platformCommission,
      activeTripsCount,
      totalTransactionsCount,
      regionalSummary,
    };
  }

  async getRegionalAnalytics(regionId: bigint) {
    const region = await this.prisma.region.findUnique({
      where: { id: regionId },
    });

    const [
      activePosCount,
      departedTripsCount,
      arrivedTripsCount,
      pendingVerificationsCount,
    ] = await Promise.all([
      this.prisma.pickupPoint.count({
        where: { regionId, isActive: true },
      }),
      this.prisma.trip.count({
        where: {
          originPoint: { regionId },
          status: { in: ['in_transit', 'arrived_dest_pos', 'completed'] },
        },
      }),
      this.prisma.trip.count({
        where: {
          destinationPoint: { regionId },
          status: { in: ['arrived_dest_pos', 'completed'] },
        },
      }),
      this.prisma.verification.count({
        where: {
          user: { regionId },
          status: 'pending',
        },
      }),
    ]);

    return {
      regionName: region ? region.name : 'Unknown Region',
      activePosCount,
      departedTripsCount,
      arrivedTripsCount,
      pendingVerificationsCount,
    };
  }

  async getEscrowLedger() {
    const [heldAggregate, releasedAggregate, recentTransactions] =
      await Promise.all([
        this.prisma.wallet.aggregate({
          _sum: { heldEscrowBalance: true },
        }),
        this.prisma.walletTransaction.aggregate({
          where: { type: TransactionType.escrow_release },
          _sum: { amount: true },
        }),
        this.prisma.walletTransaction.findMany({
          where: {
            type: {
              in: [TransactionType.escrow_hold, TransactionType.escrow_release],
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ]);

    return {
      totalHeldEscrow: Number(heldAggregate._sum.heldEscrowBalance || 0),
      totalReleasedEscrow: Number(releasedAggregate._sum.amount || 0),
      recentTransactions,
    };
  }

  async updateUserStatus(userId: bigint, status: UserStatus) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }

  async findUserById(userId: bigint) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
