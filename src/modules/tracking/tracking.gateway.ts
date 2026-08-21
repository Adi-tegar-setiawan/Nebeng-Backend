import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrackingService } from './tracking.service';
import { UpdateLocationDto } from './dto/update-location.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'tracking',
})
export class TrackingGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly trackingService: TrackingService) {}

  @SubscribeMessage('joinTripRoom')
  handleJoinRoom(
    @MessageBody('tripId') tripId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `trip_${tripId}`;
    client.join(roomName);
    return { event: 'joinedRoom', room: roomName };
  }

  @SubscribeMessage('updateLocation')
  async handleUpdateLocation(@MessageBody() dto: UpdateLocationDto) {
    await this.trackingService.saveLocation(dto);
    const roomName = `trip_${dto.tripId}`;

    this.server.to(roomName).emit('locationUpdated', {
      tripId: dto.tripId,
      latitude: dto.latitude,
      longtitude: dto.longtitude,
      timestamp: new Date().toISOString(),
    });

    return { status: 'success' };
  }
}
