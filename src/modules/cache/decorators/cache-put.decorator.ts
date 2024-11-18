import { SetMetadata } from '@nestjs/common'

export const CACHE_PUT_METADATA_KEY = Symbol('CACHE_PUT_METADATA_KEY')

export interface CachePutOptions {
  cacheName?: string
  key?: (args: any[]) => string
  ttl?: number
  condition?: (args: any[]) => boolean
  unless?: (result: any) => boolean
}

export function CachePut(options: CachePutOptions = {}): MethodDecorator {
  return SetMetadata(CACHE_PUT_METADATA_KEY, options)
}
