import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GameGateway } from './game.gateway';
import { ConnectionRegistryService } from './services/connection-registry.service';
import { GameEngineService } from './services/game-engine.service';
import { MatchmakingService } from './services/matchmaking.service';
import { RoomService } from './services/room.service';

@Module({
    imports: [AuthModule],
    providers: [
        GameGateway,
        GameEngineService,
        RoomService,
        MatchmakingService,
        ConnectionRegistryService,
    ],
})
export class GameModule {}
