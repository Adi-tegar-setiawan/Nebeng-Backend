import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TripsRepository } from './repository/trips.repository';
import { VehiclesRepository } from '../vehicles/repository/vehicles.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { QueryTripDto } from './dto/query-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripMapper } from './mappers/trip.mapper';
import {
  TripStatus,
  VehicleType,
  VerificationStatus,
} from '../../generated/prisma/enums';
import { randomBytes } from 'crypto';

@Injectable()
export class TripsService {
  constructor(
    private readonly tripsRepository: TripsRepository,
    private readonly vehiclesRepository: VehiclesRepository,
  ) {}

  private generateTripQr(): string {
    const hex = randomBytes(4).toString('hex').toUpperCase();
    return `TRIP-${hex}`;
  }

  async createTrip(
    userIdStr: string,
    userStatusVerification: string,
    dto: CreateTripDto,
  ) {
    // 1. Check status verifikasi Mitra
    if (userStatusVerification !== VerificationStatus.approved) {
      throw new ForbiddenException(
        'Hanya Mitra terverifikasi (approved) yang dapat membuat jadwal trip.',
      );
    }

    // 2. Fetch & Check kepemilikan kendaraan
    const vehicle = await this.vehiclesRepository.findById(
      BigInt(dto.vehicleId),
    );
    if (!vehicle) {
      throw new NotFoundException('Kendaraan tidak ditemukan.');
    }

    if (vehicle.userId.toString() !== userIdStr) {
      throw new ForbiddenException('Kendaraan ini bukan milik Anda.');
    }

    // 3. Pos Asal dan Pos Tujuan tidak boleh sama
    if (dto.originPointId === dto.destinationPointId) {
      throw new BadRequestException(
        'Pos Asal dan Pos Tujuan tidak boleh sama.',
      );
    }

    // 4. Logika Kapasitas Bawaan Kendaraan (Motor vs Mobil)
    let seatTotal = dto.totalSeats ?? vehicle.capacitySeats;
    let maxWeightKg =
      dto.maxWeightCapacityKg ?? Number(vehicle.maxWeightCapacityKg);

    if (vehicle.type === VehicleType.motor) {
      seatTotal = 1; // Motor selalu dikunci 1 penumpang
      if (maxWeightKg > 15) {
        maxWeightKg = 15.0; // Bagasi motor max 15 KG
      }
    }

    const qrCodeTrip = this.generateTripQr();

    const tripData = {
      mitraId: BigInt(userIdStr),
      vehicleId: BigInt(dto.vehicleId),
      originPointId: BigInt(dto.originPointId),
      destinationPointId: BigInt(dto.destinationPointId),
      vehicleType: vehicle.type,
      departureDate: new Date(dto.departureDate),
      departureTime: new Date(dto.departureTime),
      price: dto.price,
      seatTotal,
      seatAvailable: seatTotal, // Inisialisasi awal
      maxWeightCapacityKg: maxWeightKg,
      remainingWeightCapacityKg: maxWeightKg, // Inisialisasi awal
      qrCodeTrip,
      status: TripStatus.scheduled,
    };

    const trip = await this.tripsRepository.create(tripData);
    return TripMapper.toResponse(trip);
  }

  async getTrips(query: QueryTripDto) {
    const filters: any = {};

    if (query.originPointId) {
      filters.originPointId = BigInt(query.originPointId);
    }
    if (query.destinationPointId) {
      filters.destinationPointId = BigInt(query.destinationPointId);
    }
    if (query.status) {
      filters.status = query.status;
    }
    if (query.vehicleType) {
      filters.vehicleType = query.vehicleType;
    }
    if (query.date) {
      filters.departureDate = new Date(query.date);
    }

    const trips = await this.tripsRepository.findAll(filters);
    return TripMapper.toResponseList(trips);
  }

  async getTripById(idStr: string) {
    const trip = await this.tripsRepository.findById(BigInt(idStr));
    if (!trip) {
      throw new NotFoundException('Trip tidak ditemukan.');
    }
    return TripMapper.toResponse(trip);
  }

  async updateTrip(idStr: string, userIdStr: string, dto: UpdateTripDto) {
    const trip = await this.tripsRepository.findById(BigInt(idStr));
    if (!trip) {
      throw new NotFoundException('Trip tidak ditemukan.');
    }

    if (trip.mitraId.toString() !== userIdStr) {
      throw new ForbiddenException(
        'Anda tidak berhak mengubah trip orang lain.',
      );
    }

    const updateData: any = { ...dto };
    if (dto.departureDate) {
      updateData.departureDate = new Date(dto.departureDate);
    }
    if (dto.departureTime) {
      updateData.departureTime = new Date(dto.departureTime);
    }

    const updated = await this.tripsRepository.update(
      BigInt(idStr),
      updateData,
    );
    return TripMapper.toResponse(updated);
  }
}
