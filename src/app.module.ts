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
    CareerInterestModule
  ],
})
export class AppModule {}