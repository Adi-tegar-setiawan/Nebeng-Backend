import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RegionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRegion(data: { name: string; code: string }) {
    return this.prisma.region.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
      },
    });
  }

  async findRegionById(id: bigint) {
    return this.prisma.region.findUnique({
      where: { id },
    });
  }

  async findRegionByCode(code: string) {
    return this.prisma.region.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  async findAllRegions(onlyActive = false) {
    return this.prisma.region.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { name: 'asc' },
    });
  }

  async updateRegion(
    id: bigint,
    data: { name?: string; code?: string; isActive?: boolean },
  ) {
    return this.prisma.region.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code.toUpperCase() }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async createCity(data: { name: string; province: string }) {
    return this.prisma.city.create({
      data,
    });
  }

  async findAllCities() {
    return this.prisma.city.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findCityById(id: bigint) {
    return this.prisma.city.findUnique({
      where: { id },
    });
  }
}
