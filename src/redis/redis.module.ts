import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { parse } from 'path';

@Module({})
export class RedisModule {
  provideRedisClient() {
    return new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
    });
  }
}
