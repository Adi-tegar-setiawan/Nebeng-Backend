import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ReviewsRepository } from './repository/reviews.repository';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewMapper } from './mappers/review.mapper';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async createReview(currentUserId: string, dto: CreateReviewDto) {
    const reviewerBigIntId = BigInt(currentUserId);
    const revieweeBigIntId = BigInt(dto.revieweeId);
    const tripBigIntId = BigInt(dto.tripId);

    if (reviewerBigIntId === revieweeBigIntId) {
      throw new BadRequestException('Anda tidak dapat mengulas diri sendiri');
    }

    const trip = await this.reviewsRepository.findTripById(tripBigIntId);
    if (!trip) {
      throw new NotFoundException('Trip tidak ditemukan');
    }

    if (trip.status !== 'completed') {
      throw new BadRequestException(
        'Ulasan hanya dapat diberikan setelah trip berstatus selesai',
      );
    }

    const isMitra = trip.mitraId === reviewerBigIntId;
    const isCustomer = trip.orders.some(
      (order) => order.customerId === reviewerBigIntId,
    );

    if (!isMitra && !isCustomer) {
      throw new ForbiddenException(
        'Akses ditolak. Anda bukan partisipan dalam trip ini',
      );
    }

    const existingReview =
      await this.reviewsRepository.findReviewByTripAndReviewer(
        tripBigIntId,
        reviewerBigIntId,
      );

    if (existingReview) {
      throw new BadRequestException(
        'Anda sudah memberikan ulasan untuk trip ini.',
      );
    }

    const review = await this.reviewsRepository.createReview({
      tripId: tripBigIntId,
      reviewerId: reviewerBigIntId,
      revieweeId: revieweeBigIntId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return ReviewMapper.toReviewResponse(review);
  }

  async getUserRatingSummary(userId: string) {
    const userBigIntId = BigInt(userId);

    const reviews =
      await this.reviewsRepository.getReviewsByReviewee(userBigIntId);
    const aggregate =
      await this.reviewsRepository.getAverageRatingAndCount(userBigIntId);

    return ReviewMapper.toRatingSummaryResponse({
      averageRating: aggregate.averageRating,
      totalReviews: aggregate.totalReviews,
      reviews,
    });
  }
}
