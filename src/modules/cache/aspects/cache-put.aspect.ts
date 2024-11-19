import {
  CACHE_PUT_METADATA_KEY,
  CachePutOptions,
} from '../decorators/cache-put.decorator'
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { Redis } from 'ioredis'

@Aspect(CACHE_PUT_METADATA_KEY)
export class CachePutAspect implements LazyDecorator<any, CachePutOptions> {
  private readonly redis: Redis | null

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow()
  }

  wrap({ method, metadata: options }: WrapParams<any, CachePutOptions>) {
    return async (...args: any[]) => {
      const { key, condition, unless, ttl } = options

      if (condition && !condition(args)) {
        return method(...args)
      }

      const cacheName = options.cacheName

      const cacheKey = key
        ? `${cacheName}:${key(args)}`
        : `${cacheName}:${JSON.stringify(args)}`

      const result = await method(...args)

      if (!(unless && unless(result))) {
        await this.storeInCache(cacheKey, result, ttl)
      }

      return result
    }
  }

  private async storeInCache(cacheKey: string, value: any, ttl?: number) {
    if (this.redis.status !== 'ready') {
      return
    }

    try {
      if (!ttl) {
        await this.redis.set(cacheKey, JSON.stringify(value))
      } else {
        await this.redis.set(cacheKey, JSON.stringify(value), 'EX', ttl)
      }
    } catch (err) {
      console.warn(`Failed to set cache: ${err.message}`)
    }
  }
}
