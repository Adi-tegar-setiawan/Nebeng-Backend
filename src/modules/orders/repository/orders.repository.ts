import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrderWithTransaction(
    tripId: bigint,
    customerId: bigint,
    orderData: any,
    itemsData: any[],
    seatsToDeduct: number,
    weightToDeduct: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Buat Order
      const createdOrder = await tx.order.create({
        data: {
          tripId,
          customerId,
          type: orderData.type,
          seatsBooked: orderData.seatsBooked,
          totalItemsCount: orderData.totalItemsCount,
          totalWeightKg: orderData.totalWeightKg,
          totalPrice: orderData.totalPrice,
          qrCodeTicket: orderData.qrCodeTicket,
          otpClaim: orderData.otpClaim,
          status: 'pending_payment',
          escrowStatus: 'pending',
        },
      });

      // 2. Jika tipe parcel, catat detail item
      if (itemsData && itemsData.length > 0) {
        await tx.itemOrder.createMany({
          data: itemsData.map((item) => ({
            orderId: createdOrder.id,
            itemName: item.itemName,
            itemCategory: item.itemCategory,
            quantity: item.quantity,
            weightPerItemKg: item.weightPerItemKg,
            totalItemWeightKg: item.totalItemWeightKg,
            sizeEnum: item.sizeEnum,
            photoUrl: item.photoUrl,
            recipientName: item.recipientName,
            recipientPhone: item.recipientPhone,
          })),
        });
      }

      // 3. Update Sisa Kapasitas Trip
      await tx.trip.update({
        where: { id: tripId },
        data: {
          seatAvailable: { decrement: seatsToDeduct },
          remainingWeightCapacityKg: { decrement: weightToDeduct },
        },
      });

      // 4. Return Order Lengkap beserta Relasi
      return tx.order.findUnique({
        where: { id: createdOrder.id },
        include: {
          trip: {
            include: {
              originPoint: true,
              destinationPoint: true,
              mitra: true,
            },
          },
          customer: true,
          itemOrders: true,
        },
      });
    });
  }

  async findByCustomerId(customerId: bigint) {
    return this.prisma.order.findMany({
      where: { customerId },
      include: {
        trip: {
          include: {
            originPoint: true,
            destinationPoint: true,
          },
        },
        itemOrders: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: bigint) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            originPoint: true,
            destinationPoint: true,
            mitra: true,
          },
        },
        customer: true,
        itemOrders: true,
      },
    });
  }

  async updateStatus(id: bigint, status: any, escrowStatus?: any) {
    return this.prisma.order.update({
      where: { id },
      data: {
        status,
        ...(escrowStatus && { escrowStatus }),
      },
      include: {
        trip: true,
        itemOrders: true,
      },
    });
  }
}
