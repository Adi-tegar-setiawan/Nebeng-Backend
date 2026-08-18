import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  VerificationStatus,
  VerificationType,
} from '../../generated/prisma/enums';

@Injectable()
export class VerificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createVerification(data: {
    userId: bigint;
    type: VerificationType;
    files: { filePath: string; fileType: string }[];
  }) {
    return this.prisma.verification.create({
      data: {
        userId: data.userId,
        type: data.type,
        status: VerificationStatus.pending,
        files: {
          create: data.files,
        },
      },
      include: {
        files: true,
      },
    });
  }

  async findById(id: bigint) {
    return this.prisma.verification.findUnique({
      where: { id },
      include: {
        files: true,
        user: true,
      },
    });
  }

  async findAll(status?: VerificationStatus) {
    return this.prisma.verification.findMany({
      where: status ? { status } : {},
      include: {
        files: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateReviewStatus(
    id: bigint,
    adminId: bigint,
    status: VerificationStatus,
    rejectionReason?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const updatedVerfication = await tx.verification.update({
        where: { id },
        data: {
          status,
          approvedByUserId: adminId,
          rejectionReason:
            status === VerificationStatus.rejected ? rejectionReason : null,
        },
        include: { files: true },
      });

      await tx.user.update({
        where: { id: updatedVerfication.userId },
        data: {
          statusVerification: status,
        },
      });

      return updatedVerfication;
    });
  }

  async updateUserVerificationStatus(
    userId: bigint,
    status: VerificationStatus,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { statusVerification: status },
    });
  }
}
