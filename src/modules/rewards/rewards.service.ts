import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RewardsRepository } from './repository/rewards.repository';
import { EarnRewardDto } from './dto/earn-reward.dto';
import { RedeemRewardDto } from './dto/redeem-reward.dto';
import { RewardMapper } from './mappers/reward.mapper';

@Injectable()
export class RewardsService {
  constructor(private readonly rewardsRepository: RewardsRepository) {}

  async earnPoints(dto: EarnRewardDto) {
    const userBigIntId = BigInt(dto.userId);

    const user = await this.rewardsRepository.findUserById(userBigIntId);
    if (!user) {
      throw new NotFoundException('user tidak ditemukan');
    }

    const { transaction } = await this.rewardsRepository.addRewardPoints({
      userId: userBigIntId,
      points: dto.points,
      description: dto.description || 'Penambahan point reward',
    });

    return RewardMapper.toTransactionResponse(transaction);
  }

  async reedemPoints(currentUserId: string, dto: RedeemRewardDto) {
    const userBigintId = BigInt(currentUserId);

    const user = await this.rewardsRepository.findUserById(userBigintId);

    if (!user) {
      throw new NotFoundException('user tidak ditemukan');
    }

    if (user.rewardPoints < dto.points) {
      throw new BadRequestException(
        `Saldo poin anda tidka mencukupi. Poin anda saat ini ${user.rewardPoints}`,
      );
    }

    const { transaction } = await this.rewardsRepository.deductRewardPoints({
      userId: userBigintId,
      points: dto.points,
      description: dto.description || 'Penukaran poin reward',
    });

    return RewardMapper.toTransactionResponse(transaction);
  }

  async getUserRewardSummary(currentUserId: string) {
    const userBigIntId = BigInt(currentUserId);

    const user = await this.rewardsRepository.findUserById(userBigIntId);
    if (!user) {
      throw new NotFoundException('user tidak ditemukan');
    }

    const history =
      await this.rewardsRepository.getRewardHistoryByUserId(userBigIntId);

    return RewardMapper.toBalanceResponse(user, history);
  }
}
