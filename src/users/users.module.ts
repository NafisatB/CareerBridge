import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { UsersService } from './users.service';
import { PasswordService } from 'src/common/password.service';
import { UsersController } from './users.controller';

@Module({
    imports: [DatabaseModule],
    providers: [UsersService, PasswordService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
