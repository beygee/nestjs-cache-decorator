import {
  RedisModuleOptions,
  RedisOptionsFactory,
} from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'

process.env.REDIS_HOST = 'localhost'
process.env.REDIS_PORT = '6388'

@Injectable()
export class RedisConfigService implements RedisOptionsFactory {
  createRedisOptions(): RedisModuleOptions {
    return {
      config: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        maxRetriesPerRequest: 2,
        commandTimeout: 300,
        retryStrategy(times) {
          return Math.min(times * 2000, 20000)
        },
      },
    }
  }
}
