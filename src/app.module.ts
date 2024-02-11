import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GoogleAuthModule } from './auth-google/google-auth.module';
import { AuthModule } from './auth/auth.module';
import { TypedEventEmitterModule } from './common/types/typed-event-emitter/typed-event-emitter.module';
import { DatabaseModule } from './database/database.module';
import { EMailerModule } from './e-mailer/e-mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    EMailerModule,
    TypedEventEmitterModule,
    GoogleAuthModule,
  ],
})
export class AppModule {}
