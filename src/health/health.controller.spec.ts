import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return a healthy API response', () => {
    const result = controller.health();

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('ok');
    expect(result.data.service).toBe('careerbridge-backend');
    expect(result.message).toBe('CareerBridge API is healthy');
  });
});