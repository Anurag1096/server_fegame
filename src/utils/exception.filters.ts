import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from 'generated/prisma/client';

interface ErrorBody {
    statusCode: number;
    timestamp: string;
    path: string;
    message: string | string[];
}

@Catch()
export class HttpExceptionfilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionfilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        if (host.getType() !== 'http') {
            throw exception;
        }

        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            const { status, clientMessage } = this.mapPrismaError(exception);
            this.logPrismaError(exception, request, status);
            response
                .status(status)
                .json(this.buildErrorBody(status, request, clientMessage));
            return;
        }

        if (exception instanceof Prisma.PrismaClientValidationError) {
            this.logger.warn(
                `[${request.method}] ${request.url}: ${exception.message}`,
            );
            response
                .status(HttpStatus.BAD_REQUEST)
                .json(
                    this.buildErrorBody(
                        HttpStatus.BAD_REQUEST,
                        request,
                        'Invalid request data',
                    ),
                );
            return;
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const internalMessage = this.formatMessage(exception.getResponse());
            const clientMessage = this.toClientMessage(status, internalMessage);

            this.logHttpException(request, status, internalMessage);
            response
                .status(status)
                .json(this.buildErrorBody(status, request, clientMessage));
            return;
        }

        this.logger.error(
            `[${request.method}] ${request.url} Unhandled exception`,
            exception instanceof Error ? exception.stack : String(exception),
        );

        response
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(
                this.buildErrorBody(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    request,
                    'Internal server error',
                ),
            );
    }

    private mapPrismaError(
        exception: Prisma.PrismaClientKnownRequestError,
    ): { status: number; clientMessage: string } {
        switch (exception.code) {
            case 'P2002':
                return {
                    status: HttpStatus.CONFLICT,
                    clientMessage: 'User already exists',
                };
            case 'P2025':
                return {
                    status: HttpStatus.NOT_FOUND,
                    clientMessage: 'Record not found',
                };
            case 'P1003':
            case 'P2021':
            case 'P1001':
            case 'P1017':
                return {
                    status: HttpStatus.SERVICE_UNAVAILABLE,
                    clientMessage: 'Service temporarily unavailable',
                };
            default:
                return {
                    status: HttpStatus.BAD_REQUEST,
                    clientMessage: 'Request could not be completed',
                };
        }
    }

    private toClientMessage(
        status: number,
        message: string | string[] | object,
    ): string | string[] {
        // Hide internal/server errors from clients.
        if (status >= 500) {
            return 'Internal server error';
        }

        // 4xx from HttpException are app-defined and safe to show
        // (validation errors, "User already exists", "Invalid credentials", etc.)
        if (typeof message === 'string' || Array.isArray(message)) {
            return message;
        }

        return 'Request failed';
    }

    private logPrismaError(
        exception: Prisma.PrismaClientKnownRequestError,
        request: Request,
        status: number,
    ): void {
        const prefix = `[${request.method}] ${request.url} Prisma ${exception.code}`;

        if (exception.code === 'P2002') {
            this.logger.warn(
                `${prefix} duplicate on ${JSON.stringify(exception.meta?.target)}`,
            );
            return;
        }

        if (
            exception.code === 'P1003' ||
            exception.code === 'P2021' ||
            exception.code === 'P1001' ||
            exception.code === 'P1017'
        ) {
            this.logger.error(`${prefix}: ${exception.message}`);
            return;
        }

        if (status >= 500) {
            this.logger.error(`${prefix}: ${exception.message}`);
        } else {
            this.logger.warn(`${prefix}: ${exception.message}`);
        }
    }

    private logHttpException(
        request: Request,
        status: number,
        message: string | string[] | object,
    ): void {
        const prefix = `[${request.method}] ${request.url} ${status}`;

        if (status >= 500) {
            this.logger.error(prefix, message);
        } else if (status === 401 || status === 403) {
            this.logger.warn(prefix, message);
        } else if (status === 400) {
            this.logger.debug(prefix, message);
        } else {
            this.logger.warn(prefix, message);
        }
    }

    private formatMessage(
        response: string | object,
    ): string | string[] | object {
        if (typeof response === 'string') {
            return response;
        }

        if (
            typeof response === 'object' &&
            response !== null &&
            'message' in response
        ) {
            return (response as { message: string | string[] }).message;
        }

        return 'Request failed';
    }

    private buildErrorBody(
        status: number,
        request: Request,
        message: string | string[],
    ): ErrorBody {
        return {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        };
    }
}
