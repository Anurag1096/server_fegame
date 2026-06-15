export enum ClientEvents {
    CREATE_ROOM = 'createRoom',
    JOIN_ROOM = 'joinRoom',
    JOIN_QUEUE = 'joinQueue',
    LEAVE_QUEUE = 'leaveQueue',
    MAKE_MOVE = 'makeMove',
    LEAVE_ROOM = 'leaveRoom',
    REMATCH = 'rematch',
}

export enum ServerEvents {
    CONNECTED = 'connected',
    ROOM_JOINED = 'roomJoined',
    GAME_STARTED = 'gameStarted',
    GAME_UPDATE = 'gameUpdate',
    GAME_OVER = 'gameOver',
    OPPONENT_JOINED = 'opponentJoined',
    OPPONENT_DISCONNECTED = 'opponentDisconnected',
    ERROR = 'error',
    QUEUE_JOINED = 'queueJoined',
    MATCH_FOUND = 'matchFound',
}
