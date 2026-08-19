import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorators';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('customer')
  @ApiOperation({ summary: 'Buat pesanan baru (Passenger / Parcel Booking)' })
  async createOrder(@GetUser() user: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, dto);
  }

  @Get('me')
  @Roles('customer')
  @ApiOperation({
    summary: 'Daftar riwayat pesanan milik Customer yang sedang login',
  })
  async getMyOrders(@GetUser() user: any) {
    return this.ordersService.getMyOrders(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail pesanan berdasarkan ID' })
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }
}
