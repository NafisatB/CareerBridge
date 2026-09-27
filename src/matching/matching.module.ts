import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [MatchingService],
  controllers: [MatchingController],
  exports: [MatchingService]
})
export class MatchingModule {}
