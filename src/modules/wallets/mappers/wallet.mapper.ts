export class WalletMapper {
  static toResponse(wallet: any) {
    if (!wallet) return null;

    return {
      id: wallet.id.toString(),
      userId: wallet.userId.toString(),
      balance: Number(wallet.balance),
      heldEscrowBalance: Number(wallet.heldEscrowBalance),
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
      transactions: wallet.transactions
        ? wallet.transactions.map((t: any) => ({
            id: t.id.toString(),
            walletId: t.walletId.toString(),
            orderId: t.orderId ? t.orderId.toString() : null,
            amount: Number(t.amount),
            type: t.type,
            description: t.description,
            createdAt: t.createdAt,
          }))
        : [],
    };
  }
}
