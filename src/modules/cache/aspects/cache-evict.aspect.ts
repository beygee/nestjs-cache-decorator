import { Aspect } from './aspect.decorator'
import { AspectInterface } from './aspect.interface'
import { CACHE_EVICT_METADATA_KEY } from '../decorators/cache-evict.decorator'
import { Reflector } from '@nestjs/core'
import { CACHE_MANAGER, Inject } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Aspect()
export class CacheEvictAspect implements AspectInterface {
  constructor(
    private readonly reflector: Reflector,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  apply(reflector: Reflector, instance: object, methodName: string) {
    const method = instance[methodName]
    const options = reflector.get(CACHE_EVICT_METADATA_KEY, method)
    if (!options) {
      return
    }

    const {
      cacheName = 'default',
      key,
      allEntries = false,
      condition,
      beforeInvocation = false,
    } = options

    const originalMethod = method.bind(instance)

    const evictCache = async (...args: any[]) => {
      if (allEntries) {
        await this.cacheManager.reset() // Be cautious with this in production
      } else {
        const cacheKey = key
          ? key(args)
          : `${instance.constructor.name}:${methodName}:${JSON.stringify(args)}`
        await this.cacheManager.del(cacheKey)
      }
    }

    if (beforeInvocation) {
      instance[methodName] = async (...args: any[]) => {
        if (condition && !condition(args)) {
          return originalMethod(...args)
        }

        await evictCache(...args)
        return originalMethod(...args)
      }
    } else {
      instance[methodName] = async (...args: any[]) => {
        if (condition && !condition(args)) {
          return originalMethod(...args)
        }

        const result = await originalMethod(...args)
        await evictCache(...args)
        return result
      }
    }
  }
}
