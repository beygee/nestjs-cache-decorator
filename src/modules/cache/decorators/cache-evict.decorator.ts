import { createDecorator } from '@toss/nestjs-aop'

export const CACHE_EVICT_METADATA_KEY = Symbol('CACHE_EVICT_METADATA_KEY')

export interface CacheEvictOptions {
  cacheName?: string
  key?: (args: any[]) => string
  condition?: (args: any[]) => boolean
  beforeInvocation?: boolean
}

export function CacheEvict(options: CacheEvictOptions = {}): MethodDecorator {
  return createDecorator(CACHE_EVICT_METADATA_KEY, options)
}
