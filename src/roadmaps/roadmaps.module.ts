import { Module } from '@nestjs/common';
import { RoadmapsService } from './roadmaps.service';
import { RoadmapsController } from './roadmaps.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [RoadmapsService],
  controllers: [RoadmapsController],
  exports: [RoadmapsService]
})
export class RoadmapsModule {}
