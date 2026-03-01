import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    // Si es una excepción normal de Nest (NotFound, BadRequest, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      return res.status(status).json({
        statusCode: status,
        path: req.url,
        timestamp: new Date().toISOString(),
        error: response,
      });
    }

    // Errores comunes de Prisma (Unique, FK, etc.)
    // P2002: Unique constraint failed (ej: email duplicado)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return res.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          path: req.url,
          timestamp: new Date().toISOString(),
          message: 'Registro duplicado (campo único).',
          meta: exception.meta,
        });
      }

      // P2003: Foreign key constraint failed (ej: id_rol no existe)
      if (exception.code === 'P2003') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          path: req.url,
          timestamp: new Date().toISOString(),
          message: 'Relación inválida (FK). Verifica los IDs enviados.',
          meta: exception.meta,
        });
      }
    }

    // Cualquier otro error inesperado -> 500
    this.logger.error(
      `Unhandled error on ${req.method} ${req.url}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: req.url,
      timestamp: new Date().toISOString(),
      message: 'Error interno del servidor.',
    });
  }
}
