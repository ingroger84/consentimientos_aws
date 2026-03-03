import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { MailModule } from '../mail/mail.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant]),
    MailModule,
    ProfilesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
