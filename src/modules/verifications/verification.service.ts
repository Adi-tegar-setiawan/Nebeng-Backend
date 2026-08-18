import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VerificationRepository } from './repositories/verification.repository';
import { SumbitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { VerificationMapper } from './mappers/verification.mapper';
import { VerificationStatus } from '../../generated/prisma/enums';

@Injectable()
export class VerificationService {
  constructor(private readonly verificationRepo: VerificationRepository) {}

  async sumbitVerification(userId: string, dto: SumbitVerificationDto) {
    const userBigIntId = BigInt(userId);
    const verification = await this.verificationRepo.createVerification({
      userId: userBigIntId,
      type: dto.type,
      files: dto.files,
    });

    await this.verificationRepo.updateUserVerificationStatus(
      userBigIntId,
      VerificationStatus.pending,
    );

    return VerificationMapper.toResponse(verification);
  }

  async getAllVerifications(status?: VerificationStatus) {
    const list = await this.verificationRepo.findAll(status);
    return list.map(VerificationMapper.toResponse);
  }

  async getVerificationById(id: string) {
    const verification = await this.verificationRepo.findById(BigInt(id));
    if (!verification) {
      throw new NotFoundException('verifikasi tidak ditemukan');
    }

    return VerificationMapper.toResponse(verification);
  }

  async reviewVerification(
    id: string,
    adminId: string,
    dto: ReviewVerificationDto,
  ) {
    const verification = await this.verificationRepo.findById(BigInt(id));
    if (!verification) {
      throw new NotFoundException('Verifikasi tidak ditemukan');
    }

    if (dto.status === VerificationStatus.rejected && !dto.rejectionReason) {
      throw new BadRequestException('Wajib diisi saat menolak verifikasi');
    }

    const updated = await this.verificationRepo.updateReviewStatus(
      BigInt(id),
      BigInt(adminId),
      dto.status,
      dto.rejectionReason,
    );

    return VerificationMapper.toResponse(updated);
  }
}
