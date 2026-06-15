import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateRoomDto {
    @IsOptional()
    @IsString()
    mode?: 'invite';
}

export class JoinRoomDto {
    @IsString()
    @IsNotEmpty()
    roomId: string;
}

export class MakeMoveDto {
    @IsString()
    @IsNotEmpty()
    roomId: string;

    @IsInt()
    @Min(0)
    @Max(8)
    cellIndex: number;
}

export class LeaveRoomDto {
    @IsString()
    @IsNotEmpty()
    roomId: string;
}

export class RematchDto {
    @IsString()
    @IsNotEmpty()
    roomId: string;
}
