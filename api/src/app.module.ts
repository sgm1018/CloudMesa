import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './item/item.module';


@Module({
  imports: [
    AuthModule,
    UsersModule,
    FilesModule,
  ],
})
export class AppModule {}