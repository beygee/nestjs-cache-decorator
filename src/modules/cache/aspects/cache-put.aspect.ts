import { Aspect } from './aspect.decorator'
import { AspectInterface } from './aspect.interface'
import { CACHE_PUT_METADATA_KEY } from '../decorators/cache-put.decorator'
import { Reflector } from '@nestjs/core'
import { CACHE_MANAGER, Inject } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Aspect()
export class CachePutAspect implements AspectInterface {
  constructor(
    private readonly reflector: Reflector,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  apply(reflector: Reflector, instance: object, methodName: string) {
    const method = instance[methodName]
    const options = reflector.get(CACHE_PUT_METADATA_KEY, method)
    if (!options) {
      return
    }

    const { cacheName = 'default', key, ttl, condition, unless } = options

    const originalMethod = method.bind(instance)

    instance[methodName] = async (...args: any[]) => {
      if (condition && !condition(args)) {
        return originalMethod(...args)
      }

      const result = await originalMethod(...args)

      if (unless && unless(result)) {
        return result
      }

      const cacheKey = key
        ? key(args)
        : `${instance.constructor.name}:${methodName}:${JSON.stringify(args)}`

      await this.cacheManager.set(cacheKey, result, { ttl })

      return result
    }
  }
}
