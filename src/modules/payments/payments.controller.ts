import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CheckoutPaymentDto } from './dto/checkout-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorators';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles('customer')
  @ApiOperation({
    summary: 'Simulasi checkout pembayaran order (customer only)',
  })
  async checkoutPayment(@GetUser() user: any, @Body() dto: CheckoutPaymentDto) {
    return this.paymentsService.checkoutPayment(user.id, dto);
  }
}
