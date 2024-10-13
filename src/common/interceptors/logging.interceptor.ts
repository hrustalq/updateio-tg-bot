import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);
  private readonly logFile = join(process.cwd(), 'app.log');

  constructor() {
    this.ensureLogFileExists();
  }

  private ensureLogFileExists() {
    if (!existsSync(this.logFile)) {
      writeFileSync(this.logFile, '', 'utf8');
      this.logger.log(`Created log file: ${this.logFile}`);
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const userAgent = headers?.['user-agent'] || 'unknown';
    const ip = request.ip;

    const requestLog = `[Request] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`;
    this.logger.log(requestLog);
    this.writeToFile(requestLog);

    const now = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          const responseLog = `[Response] ${method} ${url} - ${response.statusCode} - ${delay}ms`;
          this.logger.log(responseLog);
          this.writeToFile(responseLog);
        },
        error: (error) => {
          const delay = Date.now() - now;
          const errorLog = `[Error] ${method} ${url} - ${error.status} - ${delay}ms - ${error.message}`;
          this.logger.error(errorLog);
          this.writeToFile(errorLog);
        },
      }),
    );
  }

  private writeToFile(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} ${message}\n`;
    appendFileSync(this.logFile, logEntry);
  }
}
