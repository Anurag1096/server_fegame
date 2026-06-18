# WebSocket Events (Tic Tac Toe)

Connect to the game namespace after signing in via `POST /auth/login` or `POST /auth/signup` (sets an httpOnly cookie).

- **URL:** `ws://localhost:3004/game`
- **Auth:** send credentials so the browser includes the `accessToken` cookie:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3004/game', {
  withCredentials: true,
});
```

Legacy handshake auth is still supported for tools/tests:

```javascript
const socket = io('http://localhost:3004/game', {
  auth: { token: accessToken },
});
```

## Server → Client

| Event | Payload | When |
|-------|---------|------|
| `connected` | `{ userId, username }` | Successful connection |
| `roomJoined` | `RoomSnapshot` | After create/join or reconnect |
| `opponentJoined` | `{ room: RoomSnapshot }` | Second player joined invite room |
| `gameStarted` | `{ room: RoomSnapshot }` | Two players ready |
| `gameUpdate` | `{ room: RoomSnapshot }` | After a valid move |
| `gameOver` | `{ room, winner, reason }` | Win, draw, forfeit, or disconnect |
| `opponentDisconnected` | `{ room, disconnectedUserId }` | Other player left or disconnected |
| `queueJoined` | `{ position }` | Added to matchmaking queue |
| `matchFound` | `{ room: RoomSnapshot }` | Queue paired two players |
| `error` | `{ code, message }` | Invalid move or game action |

## Client → Server

| Event | Payload | Behavior |
|-------|---------|----------|
| `createRoom` | `{}` | Create invite room; creator is `X` |
| `joinRoom` | `{ roomId }` | Join invite room as `O` |
| `joinQueue` | `{}` | Enter random matchmaking |
| `leaveQueue` | `{}` | Leave matchmaking queue |
| `makeMove` | `{ roomId, cellIndex }` | Place mark (`cellIndex` 0–8) |
| `leaveRoom` | `{ roomId }` | Leave room; opponent wins if in progress |

## RoomSnapshot shape

```typescript
{
  id: string;
  board: Array<'X' | 'O' | null>; // length 9
  currentTurn: 'X' | 'O';
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED' | 'ABANDONED';
  winner: 'X' | 'O' | 'draw' | null;
  mode: 'invite' | 'queue';
  players: Array<{ userId: number; username: string; symbol: 'X' | 'O' }>;
}
```

## Notes

- The server is authoritative; never send full board state from the client.
- Game state is in-memory only; disconnecting during an active game forfeits to the remaining player.
- One active room per user at a time.
