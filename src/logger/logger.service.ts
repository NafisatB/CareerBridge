import {Injectable,LoggerService as NestLoggerService} from '@nestjs/common';

@Injectable()
export class AppLogger implements NestLoggerService {
  log(message: unknown, context?: string): void {
    console.log(this.format('INFO', message, context));
  }

  error(message: unknown, trace?: string, context?: string): void {
    console.error(this.format('ERROR', message, context));

    if (trace) {
      console.error(trace);
    }
  }

  warn(message: unknown, context?: string): void {
    console.warn(this.format('WARN', message, context));
  }

  debug(message: unknown, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('DEBUG', message, context));
    }
  }

  verbose(message: unknown, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('VERBOSE', message, context));
    }
  }

  private format(
    level: string,
    message: unknown,
    context?: string,
  ): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      context: context ?? 'Application',
      message,
    });
  }
}