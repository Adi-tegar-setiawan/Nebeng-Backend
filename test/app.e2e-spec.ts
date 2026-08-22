import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  OrderType,
  ScanType,
  Role,
  TripStatus,
  VehicleType,
  VerificationType,
  ParcelSize,
} from '../src/generated/prisma/enums';

describe('Master E2E Test Suite: Complete Features & Business Flow', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Global Tokens
  let customerAToken: string;
  let customerBToken: string;
  let operatorToken: string;
  let mitraToken: string;

  // Seeded Entity IDs
  let regionId: bigint;
  let cityId: bigint;
  let posOriginId: bigint;
  let posDestinationId: bigint;
  let vehicleId: bigint;
  let tripId: bigint;
  let qrCodeTripStr: string;

  // Order & Checkpoint States
  let passengerOrderId: bigint;
  let passengerQrTicket: string;

  let parcelOrderId: bigint;
  let parcelQrTicket: string;
  let parcelOtpClaim: string;

  const timestamp = Date.now();
  const customerAEmail = `e2e.custA.${timestamp}@example.com`;
  const customerBEmail = `e2e.custB.${timestamp}@example.com`;
  const operatorEmail = `e2e.operator.${timestamp}@example.com`;
  const mitraEmail = `e2e.mitra.${timestamp}@example.com`;
  const defaultPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Seed Master Region, City, & Pickup Points
    const region = await prisma.region.create({
      data: { name: `Region E2E ${timestamp}`, code: `REG-${timestamp}` },
    });
    regionId = region.id;

    const city = await prisma.city.create({
      data: { name: 'Yogyakarta', province: 'DIY' },
    });
    cityId = city.id;

    const posOrigin = await prisma.pickupPoint.create({
      data: {
        regionId,
        cityId,
        name: `Pos Giwangan ${timestamp}`,
        address: 'Jl. Imogiri',
        latitude: -7.833,
        longitude: 110.383,
        qrCodePos: `POS-ORIGIN-${timestamp}`,
      },
    });
    posOriginId = posOrigin.id;

    const posDestination = await prisma.pickupPoint.create({
      data: {
        regionId,
        cityId,
        name: `Pos Jombor ${timestamp}`,
        address: 'Jl. Magelang',
        latitude: -7.753,
        longitude: 110.361,
        qrCodePos: `POS-DEST-${timestamp}`,
      },
    });
    posDestinationId = posDestination.id;
  });

  afterAll(async () => {
    await app.close();
  });

  // =========================================================================
  // 1. AUTHENTICATION & USER PROFILE
  // =========================================================================
  describe('1. Auth & User Verification', () => {
    it('1.1. Registrasi & Login Mitra', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Mitra E2E',
          email: mitraEmail,
          phone: `081${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: defaultPassword,
          role: Role.mitra,
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mitraEmail, password: defaultPassword })
        .expect(200);

      mitraToken = res.body.accessToken;
      expect(mitraToken).toBeDefined();
    });

    it('1.2. Upload Verifikasi KTP Mitra', async () => {
      const mitraUser = await prisma.user.findUnique({
        where: { email: mitraEmail },
      });

      await prisma.verification.create({
        data: {
          userId: mitraUser!.id,
          type: VerificationType.ktp,
        },
      });

      const profileRes = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${mitraToken}`)
        .expect(200);

      expect(profileRes.body.email).toEqual(mitraEmail);
    });

    it('1.3. Registrasi & Login Customer A & B', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Customer A',
          email: customerAEmail,
          phone: `082${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: defaultPassword,
          role: Role.customer,
        })
        .expect(201);

      const resA = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: customerAEmail, password: defaultPassword })
        .expect(200);
      customerAToken = resA.body.accessToken;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Customer B',
          email: customerBEmail,
          phone: `083${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: defaultPassword,
          role: Role.customer,
        })
        .expect(201);

      const resB = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: customerBEmail, password: defaultPassword })
        .expect(200);
      customerBToken = resB.body.accessToken;
    });

    it('1.4. Registrasi & Login Operator Pos', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Operator Pos',
          email: operatorEmail,
          phone: `084${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: defaultPassword,
          role: Role.operator_pos,
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: operatorEmail, password: defaultPassword })
        .expect(200);

      operatorToken = res.body.accessToken;
    });
  });

  // =========================================================================
  // 2. VEHICLES & TRIPS MANAGEMENT
  // =========================================================================
  describe('2. Vehicles & Trips Management', () => {
    it('2.1. Seed Kendaraan & Schedule Trip Mitra', async () => {
      const mitraUser = await prisma.user.findUnique({
        where: { email: mitraEmail },
      });

      const vehicle = await prisma.vehicle.create({
        data: {
          userId: mitraUser!.id,
          type: VehicleType.mobil,
          model: 'Avanza Veloz',
          plateNumber: `AB ${Math.floor(1000 + Math.random() * 9000)} E2E`,
          color: 'Hitam',
          capacitySeats: 6,
          maxWeightCapacityKg: 100,
        },
      });
      vehicleId = vehicle.id;
      expect(vehicleId).toBeDefined();

      qrCodeTripStr = `TRIP-QR-${timestamp}`;

      const trip = await prisma.trip.create({
        data: {
          mitraId: mitraUser!.id,
          vehicleId: vehicle.id,
          originPointId: posOriginId,
          destinationPointId: posDestinationId,
          vehicleType: VehicleType.mobil,
          departureDate: new Date(),
          departureTime: new Date(),
          price: 50000,
          seatTotal: 4,
          seatAvailable: 4,
          maxWeightCapacityKg: 20,
          remainingWeightCapacityKg: 20,
          qrCodeTrip: qrCodeTripStr,
          status: TripStatus.scheduled,
        },
      });
      tripId = trip.id;
    });
  });

  // =========================================================================
  // 3. ORDERS ENGINE & CONSTRAINTS
  // =========================================================================
  describe('3. Orders Engine & Constraints', () => {
    it('3.1. [Sad Path] Overbooking Kursi', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({
          tripId: tripId.toString(),
          type: OrderType.passenger,
          seatsBooked: 10,
        })
        .expect(400);

      expect(res.body.message).toContain('Sisa kursi tidak mencukupi');
    });

    it('3.2. [Happy Path] Order 2 Tiket Penumpang', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({
          tripId: tripId.toString(),
          type: OrderType.passenger,
          seatsBooked: 2,
        })
        .expect(201);

      passengerOrderId = BigInt(res.body.id);
      passengerQrTicket = res.body.qrCodeTicket;
    });

    it('3.3. [Happy Path] Order Pengiriman Parcel', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({
          tripId: tripId.toString(),
          type: OrderType.parcel,
          items: [
            {
              itemName: 'Laptop Asus',
              itemCategory: 'Elektronik',
              quantity: 1,
              weightPerItemKg: 3,
              sizeEnum: ParcelSize.m,
              recipientName: 'Budi Penerima',
              recipientPhone: '081234567890',
            },
          ],
        })
        .expect(201);

      parcelOrderId = BigInt(res.body.id);
      parcelQrTicket = res.body.qrCodeTicket;
      parcelOtpClaim = res.body.otpClaim;
    });
  });

  // =========================================================================
  // 4. PAYMENTS & ESCROW WALLET
  // =========================================================================
  describe('4. Payments & Escrow Ledger', () => {
    it('4.1. [Security Violation] Customer B membayar order Customer A', async () => {
      const res = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${customerBToken}`)
        .send({
          orderId: passengerOrderId.toString(),
          paymentGateway: 'midtrans',
        })
        .expect(400);

      expect(res.body.message).toContain('bukan milik anda');
    });

    it('4.2. [Happy Path] Pelunasan Order Penumpang & Hold Escrow', async () => {
      const res = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({
          orderId: passengerOrderId.toString(),
          paymentGateway: 'midtrans',
        })
        .expect(201);

      expect(res.body.message).toContain('Escrow System');
    });

    it('4.3. [Happy Path] Pelunasan Order Parcel', async () => {
      await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${customerAToken}`)
        .send({
          orderId: parcelOrderId.toString(),
          paymentGateway: 'midtrans',
        })
        .expect(201);
    });
  });

  // =========================================================================
  // 5. CHECKPOINTS & ESCROW RELEASE
  // =========================================================================
  describe('5. Checkpoints & Escrow Release', () => {
    it('5.1. [Happy Path] Check-in Origin Penumpang', async () => {
      const res = await request(app.getHttpServer())
        .post('/checkpoints/scan')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          qrCodeTrip: qrCodeTripStr,
          qrCodeTicket: passengerQrTicket,
          posId: posOriginId.toString(),
          scanType: ScanType.checkin_origin,
        })
        .expect(201);

      expect(res.body.message).toContain('IN_TRANSIT');
    });

    it('5.2. [Happy Path] Check-in Destination Parcel & Escrow Release', async () => {
      const res = await request(app.getHttpServer())
        .post('/checkpoints/scan')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          qrCodeTrip: qrCodeTripStr,
          qrCodeTicket: parcelQrTicket,
          posId: posDestinationId.toString(),
          scanType: ScanType.checkin_destination,
          otpClaim: parcelOtpClaim,
        })
        .expect(201);

      expect(res.body.message).toContain('Dana Escrow telah dicairkan');
    });

    it('5.3. [Happy Path] Check-in Destination Penumpang & Escrow Release', async () => {
      const res = await request(app.getHttpServer())
        .post('/checkpoints/scan')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send({
          qrCodeTrip: qrCodeTripStr,
          qrCodeTicket: passengerQrTicket,
          posId: posDestinationId.toString(),
          scanType: ScanType.checkin_destination,
        })
        .expect(201);

      expect(res.body.message).toContain('Dana Escrow telah dicairkan');
    });
  });
});
