import {
  CACHEABLE_METADATA_KEY,
  CacheableOptions,
} from '../decorators/cacheable.decorator'
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop'
import { Redis } from 'ioredis'
import { RedisService } from '@liaoliaots/nestjs-redis'

@Aspect(CACHEABLE_METADATA_KEY)
export class CacheableAspect implements LazyDecorator<any, CacheableOptions> {
  private readonly redis: Redis | null

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow()
  }

  wrap({ method, metadata: options }: WrapParams<any, CacheableOptions>) {
    return async (...args: any[]) => {
      const { key, condition, unless, ttl, cacheName } = options
      const cacheKey = key
        ? `${cacheName}:${key(args)}`
        : `${cacheName}:${JSON.stringify(args)}`

      if (condition && !condition(args)) {
        return method(...args)
      }

      const cachedValue = await this.getFromCache(cacheKey)
      if (cachedValue !== undefined && cachedValue !== null) {
        return cachedValue
      }

      const result = await method(...args)

      if (!(unless && unless(result))) {
        await this.storeInCache(cacheKey, result, ttl)
      }

      return result
    }
  }

  private async getFromCache(cacheKey: string) {
    if (this.redis.status !== 'ready') {
      return undefined
    }

    try {
      const result = await this.redis.get(cacheKey)
      return result ? JSON.parse(result) : undefined
    } catch (err) {
      console.warn(`Failed to get cache: ${err.message}`)
      return undefined
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
