import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TripsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.trip.create({
      data,
      include: {
        mitra: true,
        vehicle: true,
        originPoint: true,
        destinationPoint: true,
      },
    });
  }

  async findAll(filters: any) {
    return this.prisma.trip.findMany({
      where: filters,
      include: {
        mitra: true,
        vehicle: true,
        originPoint: true,
        destinationPoint: true,
      },
      orderBy: [{ departureDate: 'asc' }, { departureTime: 'asc' }],
    });
  }

  async findById(id: bigint) {
    return this.prisma.trip.findUnique({
      where: { id },
      include: {
        mitra: true,
        vehicle: true,
        originPoint: true,
        destinationPoint: true,
      },
    });
  }

  async update(id: bigint, data: any) {
    return this.prisma.trip.update({
      where: { id },
      data,
      include: {
        mitra: true,
        vehicle: true,
        originPoint: true,
        destinationPoint: true,
      },
    });
  }
}
