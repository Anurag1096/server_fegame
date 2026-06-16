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

@Catch()
export class HttpExceptionfilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionfilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            let status = HttpStatus.BAD_REQUEST;
            let message = 'Database error';

            if (exception.code === 'P2002') {
                status = HttpStatus.CONFLICT;
                message = 'Record already exists';
            } else if (exception.code === 'P1003') {
                status = HttpStatus.SERVICE_UNAVAILABLE;
                message =
                    'Database does not exist. Check DATABASE_URL and run prisma migrate dev.';
            } else if (exception.code === 'P2021') {
                status = HttpStatus.SERVICE_UNAVAILABLE;
                message =
                    'Database table missing. Run prisma migrate dev.';
            }

            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message,
            });
            return;
        }

        if (exception instanceof Prisma.PrismaClientValidationError) {
            this.logger.warn(
                `Validation Error: ${request.url}: ${exception.message}`,
            );
            response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: 'Data invalid',
            });
            return;
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const message = exception.getResponse();

            response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message,
            });
            return;
        }

        this.logger.error(
            `Unhandled exception: ${request.url}`,
            exception instanceof Error ? exception.stack : String(exception),
        );

        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: 'Internal server error',
        });
    }
}
