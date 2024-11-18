import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CacheModule } from '@nestjs/cache-manager'
import { CacheConfigService } from './modules/cache/cache-config.service'
import { UserService } from './modules/user/user.service'
import { CacheableModule } from './modules/cache/cacheable.module'
import { AopModule } from '@toss/nestjs-aop'

@Module({
  imports: [
    AopModule,
    CacheModule.registerAsync({
      useClass: CacheConfigService,
      isGlobal: true,
    }),
    CacheableModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
