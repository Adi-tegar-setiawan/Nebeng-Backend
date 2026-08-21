export class RewardMapper {
  static toTransactionResponse(transaction: any) {
    if (!transaction) return null;

    return {
      id: transaction.id.toString(),
      userId: transaction.userId.toString(),
      points: transaction.points,
      type: transaction.type,
      description: transaction.description || null,
      createdAt: transaction.createdAt
        ? transaction.createdAt.toISOString()
        : null,
      user: transaction.user
        ? {
            id: transaction.user.id.toString(),
            name: transaction.user.name,
            rewardPoints: transaction.user.rewardPoints,
          }
        : undefined,
    };
  }

  static toBalanceResponse(user: any, history?: any[]) {
    if (!user) return null;

    return {
      userId: user.id.toString(),
      currentPoints: user.rewardPoints || 0,
      history: history
        ? history.map((tx) => this.toTransactionResponse(tx))
        : [],
    };
  }
}
