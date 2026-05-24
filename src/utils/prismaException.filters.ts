import { ExceptionFilter,Catch,ArgumentsHost,Logger } from "@nestjs/common";
import { timeStamp } from "console";
import { Response ,Request} from "express";
import { Prisma } from "generated/prisma/client";



@Catch()
export class PrismaExceptionFilter extends ExceptionFilter{
    private readonly logger=new Logger()
    catch(exception:any, host:ArgumentsHost){
        const ctx=host.switchToHttp();
        const response=ctx.getResponse<Response>();
        const request=ctx.getRequest<Request>();
        const status=exception.getStatus();
        let message:string| object="Database Error";

        if(exception instanceof Prisma.PrismaClientKnownRequestError){
            if(exception.code === 'P2002'){
                message='Record already exists' 
            }
        }else if(exception instanceof Prisma.PrismaClientValidationError){
            message="Data invalid"


            this.logger.warn(`Validation Error: ${request.url}: Exception:${exception.message}`)
        }


        response.status(status).json({
            statusCode:status,
            timeStamp:new Date().toISOString(),
            message:message,
        })
    }
}