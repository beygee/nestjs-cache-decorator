import { Module } from '@nestjs/common'
import { CacheableAspect } from './aspects/cacheable.aspect'
import { CachePutAspect } from './aspects/cache-put.aspect'
import { CacheEvictAspect } from './aspects/cache-evict.aspect'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { RedisConfigService } from './redis-config.service'

@Module({
  imports: [
    RedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
  ],
  providers: [CacheableAspect, CachePutAspect, CacheEvictAspect],
})
export class CacheableModule {}
