import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors:true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect{
  
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    // console.log({payload});
    // console.log({token});

    
    this.wss.emit( 'clients-update', this.messagesWsService.getConnectedClient());

  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit( 'clients-update', this.messagesWsService.getConnectedClient()  );    
  }

  @SubscribeMessage('message-form-clien')
  onMessageFormClient( client: Socket, payload: NewMessageDto ){
    //Emite unicamente al clientes
    // client.emit('message-from-server',  {
    //   fullName: 'So yo',
    //   message: payload.message || 'no message'
    // });

    // Emitir a todos MENOS al cliente
    // client.broadcast.emit('message-from-server',  {
    //   fullName: 'So yo',
    //   message: payload.message || 'no message'
    // });

    // Emite a todos incluyendo el Cliente
    this.wss.emit('message-from-server',  {
        fullName: this.messagesWsService.getUserFullName( client.id ),
        message: payload.message || 'no message'
      });;
  }

}
