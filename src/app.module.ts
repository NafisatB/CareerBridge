import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnvironment } from './config/validation';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { SkillsModule } from './skills/skills.module';
import { CareerInterestModule } from './career-interest/career-interest.module';
import { MentorsModule } from './mentors/mentors.module';
import { MatchingModule } from './matching/matching.module';
import { CareerGuidanceModule } from './career-guidance/career-guidance.module';
import { MentorRequestsModule } from './mentor-requests/mentor-requests.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnvironment,
    }),

    LoggerModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    SkillsModule,
    CareerInterestModule,
    MentorsModule,
    MatchingModule,
    CareerGuidanceModule,
    MentorRequestsModule,
    RoadmapsModule
  ],
})
export class AppModule {}