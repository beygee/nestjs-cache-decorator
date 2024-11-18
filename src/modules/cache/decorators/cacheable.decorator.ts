import { SetMetadata } from '@nestjs/common'

export const CACHEABLE_METADATA_KEY = Symbol('CACHEABLE_METADATA_KEY')

export interface CacheableOptions {
  cacheName?: string
  key?: (args: any[]) => string
  ttl?: number
  condition?: (args: any[]) => boolean
  unless?: (result: any) => boolean
}

export function Cacheable(options: CacheableOptions = {}): MethodDecorator {
  return SetMetadata(CACHEABLE_METADATA_KEY, options)
}
