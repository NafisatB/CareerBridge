import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [SkillsService],
  controllers: [SkillsController],
  exports: [SkillsService]
})
export class SkillsModule {}
