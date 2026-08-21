import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}

  @ApiOperation({ summary: 'Kirim ulasan dan rating untuk trip' })
  @Post()
  async createReview(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(req.user.id, dto);
  }

  @ApiOperation({
    summary: 'Ambil ringkasan rating dan daftar ulasan milik user',
  })
  @Get('users/:userId')
  async getUserRatingSummary(@Param('userId') userId: string) {
    return this.reviewService.getUserRatingSummary(userId);
  }
}
