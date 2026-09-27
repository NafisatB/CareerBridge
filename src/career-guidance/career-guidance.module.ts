import { Module } from '@nestjs/common';
import { CareerGuidanceController } from './career-guidance.controller';
import { CareerGuidanceService } from './career-guidance.service';
import { DatabaseModule } from 'src/database/database.module';
import { MatchingModule } from 'src/matching/matching.module';

@Module({
  imports: [DatabaseModule, MatchingModule],
  controllers: [CareerGuidanceController],
  providers: [CareerGuidanceService],
})
export class CareerGuidanceModule {}
