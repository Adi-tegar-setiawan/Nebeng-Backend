import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findReviewByTripAndReviewer(tripId: bigint, reviewerId: bigint) {
    return this.prisma.tripReview.findFirst({
      where: {
        tripId,
        reviewerId,
      },
    });
  }

  async createReview(data: {
    tripId: bigint;
    reviewerId: bigint;
    revieweeId: bigint;
    rating: number;
    comment?: string;
  }) {
    return this.prisma.tripReview.create({
      data: {
        tripId: data.tripId,
        reviewerId: data.reviewerId,
        revieweeId: data.revieweeId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        reviewer: true,
        reviewee: true,
        trip: true,
      },
    });
  }

  async getReviewsByReviewee(revieweeId: bigint) {
    return this.prisma.tripReview.findMany({
      where: { revieweeId },
      include: {
        reviewer: true,
        trip: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAverageRatingAndCount(revieweeId: bigint) {
    const aggregate = await this.prisma.tripReview.aggregate({
      where: { revieweeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      averageRating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.rating || 0,
    };
  }

  async findTripById(tripId: bigint) {
    return this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        orders: true,
      },
    });
  }
}
