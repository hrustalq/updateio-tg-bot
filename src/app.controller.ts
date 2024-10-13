import { Controller, Get, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get('health')
  healthCheck() {
    this.logger.log('Health check performed');
    return { status: 'ok' };
  }

  @Get('logs')
  getLogs() {
    try {
      const logContent = readFileSync(join(process.cwd(), 'app.log'), 'utf8');
      return { logs: logContent };
    } catch (error) {
      this.logger.error('Error reading log file', error.stack);
      return { error: 'Unable to read log file' };
    }
  }
}
