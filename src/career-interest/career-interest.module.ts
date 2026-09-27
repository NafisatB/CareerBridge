import { Module } from '@nestjs/common';
import { CareerInterestsController } from './career-interest.controller';
import { CareerInterestsService } from './career-interest.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CareerInterestsController],
  providers: [CareerInterestsService],
  exports: [CareerInterestsService]
})
export class CareerInterestModule {}
