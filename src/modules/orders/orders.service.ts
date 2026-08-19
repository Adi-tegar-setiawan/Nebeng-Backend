import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrdersRepository } from './repository/orders.repository';
import { TripsRepository } from '../trips/repository/trips.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderMapper } from './mappers/order.mapper';
import { OrderType, TripStatus } from '../../generated/prisma/enums';
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly tripsRepository: TripsRepository,
  ) {}

  private generateTicketQr(): string {
    const hex = randomBytes(4).toString('hex').toUpperCase();
    return `TKT-${hex}`;
  }

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  async createOrder(customerIdStr: string, dto: CreateOrderDto) {
    // 1. Fetch Trip & Validasi Eksistensi
    const trip = await this.tripsRepository.findById(BigInt(dto.tripId));
    if (!trip) {
      throw new NotFoundException('Jadwal Trip tidak ditemukan.');
    }

    // 2. Validasi Status Trip (Must be scheduled)
    if (trip.status !== TripStatus.scheduled) {
      throw new BadRequestException(
        'Trip ini sudah tidak menerima pemesanan baru.',
      );
    }

    let seatsBooked = 0;
    let totalItemsCount = 0;
    let totalWeightKg = 0;
    let totalPrice = 0;
    let otpClaim: string | null = null;
    const itemsDataProcessed: any[] = [];

    // 3. Logika Bisnis Penumpang (Passenger)
    if (dto.type === OrderType.passenger) {
      seatsBooked = dto.seatsBooked ?? 1;

      if (trip.seatAvailable < seatsBooked) {
        throw new BadRequestException(
          `Sisa kursi tidak mencukupi. Tersedia: ${trip.seatAvailable}, Diminta: ${seatsBooked}`,
        );
      }

      // Hitung Total Harga Tiket Penumpang
      totalPrice = Number(trip.price) * seatsBooked;
    }

    // 4. Logika Bisnis Pengiriman Barang (Parcel)
    if (dto.type === OrderType.parcel) {
      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestException(
          'Item barang wajib diisi untuk pemesanan jenis Parcel.',
        );
      }

      totalItemsCount = dto.items.length;

      // Hitung akumulasi berat dan susun payload item
      for (const item of dto.items) {
        const itemTotalWeight = item.weightPerItemKg * item.quantity;
        totalWeightKg += itemTotalWeight;

        itemsDataProcessed.push({
          ...item,
          totalItemWeightKg: itemTotalWeight,
        });
      }

      const remainingWeight = Number(trip.remainingWeightCapacityKg);
      if (remainingWeight < totalWeightKg) {
        throw new BadRequestException(
          `Sisa kapasitas bagasi tidak mencukupi. Tersedia: ${remainingWeight} KG, Total Paket: ${totalWeightKg} KG`,
        );
      }

      // Hitung Harga Pengiriman Paket (misal: Menggunakan kalkulasi per KG atau minimum base fare)
      // Disini menggunakan kalkulasi akumulasi berat x tarif per kg trip
      totalPrice = Number(trip.price) * totalWeightKg;

      // Generate OTP 6-Digit untuk klaim penerima barang
      otpClaim = this.generateOtp();
    }

    const qrCodeTicket = this.generateTicketQr();

    const orderPayload = {
      type: dto.type,
      seatsBooked,
      totalItemsCount,
      totalWeightKg,
      totalPrice,
      qrCodeTicket,
      otpClaim,
    };

    // 5. Eksekusi Transaksi Atomik
    const order = await this.ordersRepository.createOrderWithTransaction(
      BigInt(dto.tripId),
      BigInt(customerIdStr),
      orderPayload,
      itemsDataProcessed,
      seatsBooked,
      totalWeightKg,
    );

    return OrderMapper.toResponse(order);
  }

  async getMyOrders(customerIdStr: string) {
    const orders = await this.ordersRepository.findByCustomerId(
      BigInt(customerIdStr),
    );
    return OrderMapper.toResponseList(orders);
  }

  async getOrderById(idStr: string) {
    const order = await this.ordersRepository.findById(BigInt(idStr));
    if (!order) {
      throw new NotFoundException('Order tidak ditemukan.');
    }
    return OrderMapper.toResponse(order);
  }
}
