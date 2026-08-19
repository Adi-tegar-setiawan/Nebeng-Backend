import { Injectable } from '@nestjs/common';
import { WalletsRepository } from './repository/wallets.repository';
import { WalletMapper } from './mappers/wallet.mapper';

@Injectable()
export class WalletsService {
  constructor(private readonly walletRepository: WalletsRepository) {}

  async getMyWallet(userIdStr: string) {
    let wallet = await this.walletRepository.findByUserId(BigInt(userIdStr));

    if (!wallet) {
      wallet = await this.walletRepository.createWallets(BigInt(userIdStr));
    }

    return WalletMapper.toResponse(wallet);
  }

  async holdEscrow(mitraUserIdStr: string, orderIdStr: string, amount: number) {
    let wallet = await this.walletRepository.findByUserId(
      BigInt(mitraUserIdStr),
    );

    if (!wallet) {
      wallet = await this.walletRepository.createWallets(
        BigInt(mitraUserIdStr),
      );
    }

    await this.walletRepository.processEscrowHold(
      wallet.id,
      BigInt(orderIdStr),
      amount,
    );
  }
}
