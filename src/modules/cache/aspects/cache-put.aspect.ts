import {
  CACHE_PUT_METADATA_KEY,
  CachePutOptions,
} from '../decorators/cache-put.decorator'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop'
import { Inject } from '@nestjs/common'

@Aspect(CACHE_PUT_METADATA_KEY)
export class CachePutAspect implements LazyDecorator<any, CachePutOptions> {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

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

      if (unless && unless(result)) {
        return result
      }

      await this.cacheManager.set(cacheKey, result, ttl)

      return result
    }
  }
}
