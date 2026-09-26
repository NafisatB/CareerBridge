// import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
// import { Response } from 'express';
// import { Prisma } from 'generated/prisma/client';

// @Catch(Prisma.PrismaClientKnownRequestError)
// export class PrismaExceptionFilter
//   implements ExceptionFilter {
//   catch(
//     exception: Prisma.PrismaClientKnownRequestError,
//     host: ArgumentsHost,
//   ) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();

//     console.error('Code:', exception.code);
//     console.error('Message:', exception.message);
//     console.error('Meta:', exception.meta);

//     let status = HttpStatus.INTERNAL_SERVER_ERROR;
//     let message = 'A database error occurred';

//     switch (exception.code) {
//       case 'P2002':
//         status = HttpStatus.CONFLICT;
//         message = 'A record with the provided value already exists';
//         break;

//       case 'P2025':
//         status = HttpStatus.NOT_FOUND;
//         message = 'The requested record was not found';
//         break;

//       default:
//         break;
//     }

//     response.status(status).json({
//       statusCode: status,
//       message,
//       timestamp: new Date().toISOString(),
//     });
//   }
// }


import {ArgumentsHost,Catch,ExceptionFilter,HttpException,HttpStatus} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();

    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseBody = exceptionResponse as Record<string, unknown>;

        if (typeof responseBody.message === 'string') {
          message = responseBody.message;
        } else if (Array.isArray(responseBody.message)) {
          message = 'Validation failed';
          errors = responseBody.message;
        }

        if (responseBody.error) {
          errors ??= responseBody.error;
        }
      }
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      ...(errors !== undefined ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
