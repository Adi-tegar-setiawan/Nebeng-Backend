import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CheckpointsRepository } from './repository/checkpoints.repository';
import { ScanCheckpointDto } from './dto/scan-checkpoint.dto';
import { CheckpointMapper } from './mappers/checkpoint.mapper';
import { OrderType, ScanType } from '../../generated/prisma/enums';

@Injectable()
export class CheckpointsService {
  constructor(private readonly checkpointsRepository: CheckpointsRepository) {}

  async scanCheckpoint(operatorUserIdStr: string, dto: ScanCheckpointDto) {
    // 1. Fetch Trip & Order
    const trip = await this.checkpointsRepository.findTripByQr(dto.qrCodeTrip);
    if (!trip) {
      throw new NotFoundException(
        'Data Trip dengan QR tersebut tidak ditemukan.',
      );
    }

    const order = await this.checkpointsRepository.findOrderByQr(
      dto.qrCodeTicket,
    );
    if (!order) {
      throw new NotFoundException(
        'Data Tiket/Order dengan QR tersebut tidak ditemukan.',
      );
    }

    if (order.tripId !== trip.id) {
      throw new BadRequestException(
        'Tiket/Order ini tidak terdaftar pada Trip ini.',
      );
    }

    const posIdBigInt = BigInt(dto.posId);
    const operatorUserIdBigInt = BigInt(operatorUserIdStr);

    // 2. Skenario SCAN 1: CHECKIN ORIGIN (Pos Asal)
    if (dto.scanType === ScanType.checkin_origin) {
      if (trip.originPointId !== posIdBigInt) {
        throw new BadRequestException(
          'Proses Check-in Origin harus dilakukan di Pos Asal yang sesuai.',
        );
      }

      const log = await this.checkpointsRepository.processCheckinOrigin(
        trip.id,
        order.id,
        posIdBigInt,
        operatorUserIdBigInt,
        dto.securitySealQr,
      );

      return {
        message:
          'Check-in Pos Asal berhasil. Trip dan Order dalam status IN_TRANSIT.',
        checkpoint: CheckpointMapper.toResponse(log),
      };
    }

    // 3. Skenario SCAN 2: CHECKIN DESTINATION (Pos Tujuan)
    if (dto.scanType === ScanType.checkin_destination) {
      if (trip.destinationPointId !== posIdBigInt) {
        throw new BadRequestException(
          'Proses Check-in Destination harus dilakukan di Pos Tujuan yang sesuai.',
        );
      }

      // Validasi OTP Claim untuk pengiriman Parcel
      if (order.type === OrderType.parcel) {
        if (!dto.otpClaim) {
          throw new BadRequestException(
            'Kode OTP Klaim penerima wajib diisi untuk penyerahan paket.',
          );
        }
        if (order.otpClaim !== dto.otpClaim) {
          throw new BadRequestException(
            'Kode OTP Klaim yang dimasukkan salah/tidak cocok.',
          );
        }
      }

      const totalPriceNum = Number(order.totalPrice);

      const log =
        await this.checkpointsRepository.processCheckinDestinationAndReleaseEscrow(
          trip.id,
          order.id,
          posIdBigInt,
          operatorUserIdBigInt,
          trip.mitraId,
          totalPriceNum,
        );

      return {
        message:
          'Check-in Pos Tujuan & Penyerahan berhasil. Transaksi Selesai dan Dana Escrow telah dicairkan ke Wallet Mitra.',
        checkpoint: CheckpointMapper.toResponse(log),
      };
    }

    throw new BadRequestException('Scan type tidak valid.');
  }
}
