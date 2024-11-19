import {
  CACHE_EVICT_METADATA_KEY,
  CacheEvictOptions,
} from '../decorators/cache-evict.decorator'
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { Redis } from 'ioredis'

@Aspect(CACHE_EVICT_METADATA_KEY)
export class CacheEvictAspect implements LazyDecorator<any, CacheEvictOptions> {
  private readonly redis: Redis | null

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getOrThrow()
  }

  wrap({ method, metadata: options }: WrapParams<any, CacheEvictOptions>) {
    return async (...args: any[]) => {
      const { key, condition, beforeInvocation } = options

      if (condition && !condition(args)) {
        return method(...args)
      }

      const cacheName = options.cacheName

      const cacheKey = key
        ? `${cacheName}:${key(args)}`
        : `${cacheName}:${JSON.stringify(args)}`

      const evict = async () => {
        await this.deleteFromCache(cacheKey)
      }

      if (beforeInvocation) {
        await evict()
        return method(...args)
      } else {
        const result = await method(...args)
        await evict()
        return result
      }
    }
  }

  private async deleteFromCache(cacheKey: string) {
    if (this.redis.status !== 'ready') {
      return
    }

    try {
      await this.redis.del(cacheKey)
    } catch (err) {
      console.warn(`Failed to delete cache: ${err.message}`)
    }
  }
}
