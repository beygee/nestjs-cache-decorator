import { Aspect } from './aspect.decorator'
import { AspectInterface } from './aspect.interface'
import { CACHEABLE_METADATA_KEY } from '../decorators/cacheable.decorator'
import { Reflector } from '@nestjs/core'
import { CACHE_MANAGER, Inject } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Aspect()
export class CacheableAspect implements AspectInterface {
  constructor(
    private readonly reflector: Reflector,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  apply(reflector: Reflector, instance: object, methodName: string) {
    const method = instance[methodName]
    const options = reflector.get(CACHEABLE_METADATA_KEY, method)
    if (!options) {
      return
    }

    const { cacheName = 'default', key, ttl, condition, unless } = options

    const originalMethod = method.bind(instance)

    instance[methodName] = async (...args: any[]) => {
      if (condition && !condition(args)) {
        return originalMethod(...args)
      }

      const cacheKey = key
        ? key(args)
        : `${instance.constructor.name}:${methodName}:${JSON.stringify(args)}`

      const cachedValue = await this.cacheManager.get(cacheKey)
      if (cachedValue !== undefined && cachedValue !== null) {
        return cachedValue
      }

      const result = await originalMethod(...args)

      if (unless && unless(result)) {
        return result
      }

      await this.cacheManager.set(cacheKey, result, { ttl })

      return result
    }
  }
}
