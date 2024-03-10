import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import googleConfig from './auth-google/config/google.config';
import { GoogleAuthModule } from './auth-google/google-auth.module';
import { AuthModule } from './auth/auth.module';
import authConfig from './auth/config/auth.config';
import cryptoConfig from './common/encrypting/config/crypto.config';
import { TypedEventEmitterModule } from './common/types/typed-event-emitter/typed-event-emitter.module';
import appConfig from './config/app.config';
import databaseConfig from './database/config/database.config';
import { DatabaseModule } from './database/database.module';
import eMailerConfig from './e-mailer/config/e-mailer.config';
import { EMailerModule } from './e-mailer/e-mailer.module';
import redisConfig from './redis/config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        authConfig,
        googleConfig,
        cryptoConfig,
        databaseConfig,
        eMailerConfig,
        redisConfig,
      ],
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    EMailerModule,
    TypedEventEmitterModule,
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleAuthModule] : []),
  ],
})
export class AppModule {}
