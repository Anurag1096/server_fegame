import { ExceptionFilter, Catch, ArgumentsHost, HttpException, } from "@nestjs/common";
import { Response, Request } from "express";



@Catch()
export class HttpExceptionfilter implements ExceptionFilter {

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        response.status(status).json(

            {
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
            }
        )
    }
}