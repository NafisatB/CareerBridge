import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      success: true,
      data: {
        status: 'ok',
        service: 'careerbridge-backend',
        environment: process.env.NODE_ENV ?? 'development',
      },
      message: 'CareerBridge API is healthy',
    };
  }
}