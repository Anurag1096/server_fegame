import {
    ValidationPipe,
    UseGuards,
    UsePipes,
    Logger,
} from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { JwtPayload } from 'src/auth/guards/jwt-auth.guard';
import {
    CreateRoomDto,
    JoinRoomDto,
    LeaveRoomDto,
    MakeMoveDto,
} from './dto/game-events.dto';
import { ConnectionRegistryService } from './services/connection-registry.service';
import { MatchmakingService } from './services/matchmaking.service';
import { GameError, RoomService } from './services/room.service';
import { ClientEvents, ServerEvents } from './types/events.enum';
import { GameStatus, toRoomSnapshot } from './types/game.types';
import { getSocketCorsOptions } from 'src/config/cors.config';

interface SocketUser {
    userId: number;
    username: string;
}

@WebSocketGateway({
    namespace: '/game',
    cors: getSocketCorsOptions(),
})
@UseGuards(WsJwtGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(GameGateway.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly connectionRegistry: ConnectionRegistryService,
        private readonly roomService: RoomService,
        private readonly matchmakingService: MatchmakingService,
    ) {}

    async handleConnection(client: Socket) {
        const token = this.extractToken(client);
        if (!token) {
            client.disconnect();
            return;
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
            const user: SocketUser = {
                userId: payload.sub,
                username: payload.userName,
            };
            client.data.user = user;

            const previousSocketId = this.connectionRegistry.register(
                client.id,
                user.userId,
                user.username,
            );

            if (previousSocketId) {
                this.server.sockets.sockets.get(previousSocketId)?.disconnect();
            }

            const existingRoom = this.roomService.getRoomByUserId(user.userId);
            if (existingRoom) {
                client.join(existingRoom.id);
                this.roomService.updatePlayerSocket(
                    existingRoom.id,
                    user.userId,
                    client.id,
                );
                client.emit(ServerEvents.ROOM_JOINED, toRoomSnapshot(existingRoom));
            }

            client.emit(ServerEvents.CONNECTED, {
                userId: user.userId,
                username: user.username,
            });
        } catch (error) {
            this.logger.warn(`Connection rejected: ${String(error)}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const user = this.connectionRegistry.unregister(client.id);
        if (!user) {
            return;
        }

        this.matchmakingService.removeUserFromQueue(user.userId);

        const { room, opponentUserId, forfeit } =
            this.roomService.handlePlayerDisconnect(user.userId);

        if (!room) {
            return;
        }

        if (forfeit && opponentUserId) {
            this.server.to(room.id).emit(ServerEvents.OPPONENT_DISCONNECTED, {
                room: toRoomSnapshot(room),
                disconnectedUserId: user.userId,
            });
            this.server.to(room.id).emit(ServerEvents.GAME_OVER, {
                room: toRoomSnapshot(room),
                winner: room.winner,
                reason: 'opponent_disconnected',
            });
            return;
        }

        if (room.status === GameStatus.WAITING) {
            this.server.to(room.id).emit(ServerEvents.OPPONENT_DISCONNECTED, {
                room: toRoomSnapshot(room),
                disconnectedUserId: user.userId,
            });
        }
    }

    @SubscribeMessage(ClientEvents.CREATE_ROOM)
    handleCreateRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() _payload: CreateRoomDto,
    ) {
        const user = this.getUser(client);
        this.matchmakingService.leaveQueue(user.userId);

        const room = this.roomService.createRoom(
            user.userId,
            user.username,
            client.id,
            'invite',
        );

        client.join(room.id);
        client.emit(ServerEvents.ROOM_JOINED, toRoomSnapshot(room));
        return { roomId: room.id };
    }

    @SubscribeMessage(ClientEvents.JOIN_ROOM)
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: JoinRoomDto,
    ) {
        const user = this.getUser(client);
        this.matchmakingService.leaveQueue(user.userId);

        const room = this.roomService.joinRoom(
            payload.roomId,
            user.userId,
            user.username,
            client.id,
        );

        client.join(room.id);

        if (room.players.length === 1) {
            client.emit(ServerEvents.ROOM_JOINED, toRoomSnapshot(room));
            return { room: toRoomSnapshot(room) };
        }

        this.server.to(room.id).emit(ServerEvents.OPPONENT_JOINED, {
            room: toRoomSnapshot(room),
        });
        this.server.to(room.id).emit(ServerEvents.GAME_STARTED, {
            room: toRoomSnapshot(room),
        });

        return { room: toRoomSnapshot(room) };
    }

    @SubscribeMessage(ClientEvents.JOIN_QUEUE)
    handleJoinQueue(@ConnectedSocket() client: Socket) {
        const user = this.getUser(client);

        const result = this.matchmakingService.joinQueue(
            user.userId,
            user.username,
            client.id,
        );

        if (result.type === 'queued') {
            client.emit(ServerEvents.QUEUE_JOINED, { position: result.position });
            return { queued: true, position: result.position };
        }

        for (const player of result.players) {
            const socketId =
                this.connectionRegistry.getSocketByUser(player.userId) ??
                player.socketId;
            const socket = this.server.sockets.sockets.get(socketId);
            socket?.join(result.room.id);
        }

        this.server.to(result.room.id).emit(ServerEvents.MATCH_FOUND, {
            room: toRoomSnapshot(result.room),
        });
        this.server.to(result.room.id).emit(ServerEvents.GAME_STARTED, {
            room: toRoomSnapshot(result.room),
        });

        return { matched: true, room: toRoomSnapshot(result.room) };
    }

    @SubscribeMessage(ClientEvents.LEAVE_QUEUE)
    handleLeaveQueue(@ConnectedSocket() client: Socket) {
        const user = this.getUser(client);
        const removed = this.matchmakingService.leaveQueue(user.userId);
        return { removed };
    }

    @SubscribeMessage(ClientEvents.MAKE_MOVE)
    handleMakeMove(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: MakeMoveDto,
    ) {
        const user = this.getUser(client);

        try {
            const result = this.roomService.makeMove(
                payload.roomId,
                user.userId,
                payload.cellIndex,
            );

            this.server.to(payload.roomId).emit(ServerEvents.GAME_UPDATE, {
                room: result.snapshot,
            });

            if (result.gameOver) {
                this.server.to(payload.roomId).emit(ServerEvents.GAME_OVER, {
                    room: result.snapshot,
                    winner: result.winner,
                    reason: 'completed',
                });
            }

            return { room: result.snapshot };
        } catch (error) {
            if (error instanceof GameError) {
                this.emitError(client, error.code, error.message);
                return;
            }
            throw error;
        }
    }

    @SubscribeMessage(ClientEvents.LEAVE_ROOM)
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: LeaveRoomDto,
    ) {
        const user = this.getUser(client);
        const { room, abandoned, winner } = this.roomService.leaveRoom(
            payload.roomId,
            user.userId,
        );

        client.leave(payload.roomId);

        if (abandoned || !room) {
            return { left: true };
        }

        if (winner) {
            this.server.to(payload.roomId).emit(ServerEvents.GAME_OVER, {
                room: toRoomSnapshot(room),
                winner,
                reason: 'forfeit',
            });
        } else {
            this.server.to(payload.roomId).emit(ServerEvents.OPPONENT_DISCONNECTED, {
                room: toRoomSnapshot(room),
                disconnectedUserId: user.userId,
            });
        }

        return { left: true };
    }

    private getUser(client: Socket): SocketUser {
        return client.data.user as SocketUser;
    }

    private emitError(client: Socket, code: string, message: string) {
        client.emit(ServerEvents.ERROR, { code, message });
    }

    private extractToken(client: Socket): string | undefined {
        const authToken = client.handshake.auth?.token;
        if (typeof authToken === 'string' && authToken.length > 0) {
            return authToken;
        }

        const header = client.handshake.headers.authorization;
        if (typeof header === 'string' && header.startsWith('Bearer ')) {
            return header.slice(7);
        }

        return undefined;
    }
}
