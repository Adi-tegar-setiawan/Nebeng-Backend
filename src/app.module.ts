import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { DriverVerificationsModule } from './modules/verifications/verifications.module';
import { RegionsModule } from './modules/regions/region.module';
import { PickupPointsModule } from './modules/pickup-points/pickup-points.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { TripsModule } from './modules/trips/trips.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    DriverVerificationsModule,
    RegionsModule,
    PickupPointsModule,
    VehiclesModule,
    TripsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
