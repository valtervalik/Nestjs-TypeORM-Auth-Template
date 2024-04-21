import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { AllConfigType } from 'src/config/config.type';

@Module({})
export class RedisModule {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  provideRedisClient() {
    return new Redis({
      host: this.configService.getOrThrow('redis.host', { infer: true }),
      port: this.configService.getOrThrow('redis.port', { infer: true }),
      password: this.configService.getOrThrow('redis.password', {
        infer: true,
      }),
    });
  }
}
