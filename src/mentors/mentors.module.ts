import { Module } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [MentorsService],
  controllers: [MentorsController],
  exports: [MentorsService]
})
export class MentorsModule {}
