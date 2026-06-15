export type Cell = 'X' | 'O' | null;
export type Board = Cell[];
export type Symbol = 'X' | 'O';
export type GameMode = 'invite' | 'queue';
export type GameWinner = Symbol | 'draw' | null;

export enum GameStatus {
    WAITING = 'WAITING',
    IN_PROGRESS = 'IN_PROGRESS',
    FINISHED = 'FINISHED',
    ABANDONED = 'ABANDONED',
}

export interface Player {
    userId: number;
    username: string;
    symbol: Symbol;
    socketId: string;
}

export interface Room {
    id: string;
    players: Player[];
    board: Board;
    currentTurn: Symbol;
    status: GameStatus;
    winner: GameWinner;
    createdAt: Date;
    mode: GameMode;
}

export interface RoomSnapshot {
    id: string;
    board: Board;
    currentTurn: Symbol;
    status: GameStatus;
    winner: GameWinner;
    mode: GameMode;
    players: Array<{ userId: number; username: string; symbol: Symbol }>;
}

export function toRoomSnapshot(room: Room): RoomSnapshot {
    return {
        id: room.id,
        board: [...room.board],
        currentTurn: room.currentTurn,
        status: room.status,
        winner: room.winner,
        mode: room.mode,
        players: room.players.map(({ userId, username, symbol }) => ({
            userId,
            username,
            symbol,
        })),
    };
}
