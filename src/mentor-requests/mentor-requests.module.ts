import { Module } from '@nestjs/common';
import { MentorRequestsService } from './mentor-requests.service';
import { MentorRequestsController } from './mentor-requests.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [MentorRequestsService],
  controllers: [MentorRequestsController],
  exports: [MentorRequestsService]
})
export class MentorRequestsModule {}
