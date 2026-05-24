import { ExceptionFilter, Catch, ArgumentsHost, HttpException, } from "@nestjs/common";
import { Response, Request } from "express";
import { Prisma } from "generated/prisma/client";



@Catch()
export class HttpExceptionfilter implements ExceptionFilter {

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        //This is for the normal exception
        const status = exception.getStatus();
        const message:string| object =exception.getResponse();


        response.status(status).json(

            {
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message:message,
            }
        )
    }
}