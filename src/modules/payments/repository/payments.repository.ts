import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  EscrowStatus,
  OrderStatus,
  PaymentStatus,
} from '../../../generated/prisma/enums';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPaymentAndUpdateOrder(
    orderId: bigint,
    paymentGateway: string,
    transactionId: string,
    amount: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId,
          paymentGateway,
          transactionId,
          amount,
          status: PaymentStatus.success,
        },
      });

      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.paid,
          escrowStatus: EscrowStatus.held,
        },
        include: {
          trip: true,
        },
      });

      return { payment, order };
    });
  }
}
