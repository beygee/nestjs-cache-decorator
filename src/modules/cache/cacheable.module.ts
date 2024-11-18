import { Module } from '@nestjs/common'
import { CacheableAspect } from './aspects/cacheable.aspect'
import { CachePutAspect } from './aspects/cache-put.aspect'
import { CacheEvictAspect } from './aspects/cache-evict.aspect'

@Module({
  imports: [],
  providers: [CacheableAspect, CachePutAspect, CacheEvictAspect],
})
export class CacheableModule {}
