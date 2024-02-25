import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EMailerService } from './e-mailer.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: configService.getOrThrow('emailer.service', { infer: true }),
          secure: false,
          auth: {
            user: configService.getOrThrow('emailer.user', { infer: true }),
            pass: configService.getOrThrow('emailer.passkey', { infer: true }),
          },
        },
        defaults: {
          from: `"${configService.getOrThrow('emailer.username', {
            infer: true,
          })}" <${configService.getOrThrow('emailer.user', { infer: true })}}>`,
        },
        template: {
          dir: join(__dirname, '/templates'),
          adapter: new EjsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EMailerService],
})
export class EMailerModule {}
