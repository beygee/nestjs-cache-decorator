import {
  CACHE_EVICT_METADATA_KEY,
  CacheEvictOptions,
} from '../decorators/cache-evict.decorator'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop'
import { Inject } from '@nestjs/common'

@Aspect(CACHE_EVICT_METADATA_KEY)
export class CacheEvictAspect implements LazyDecorator<any, CacheEvictOptions> {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

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
        await this.cacheManager.del(cacheKey)
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
}
