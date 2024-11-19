import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserService } from './modules/user/user.service'
import { CacheableModule } from './modules/cache/cacheable.module'
import { AopModule } from '@toss/nestjs-aop'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { RedisConfigService } from './modules/cache/redis-config.service'

@Module({
  imports: [
    AopModule,
    RedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
    CacheableModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
