import { SetMetadata } from '@nestjs/common'

export const CACHE_EVICT_METADATA_KEY = Symbol('CACHE_EVICT_METADATA_KEY')

export interface CacheEvictOptions {
  cacheName?: string
  key?: (args: any[]) => string
  allEntries?: boolean
  condition?: (args: any[]) => boolean
  beforeInvocation?: boolean
}

export function CacheEvict(options: CacheEvictOptions = {}): MethodDecorator {
  return SetMetadata(CACHE_EVICT_METADATA_KEY, options)
}
