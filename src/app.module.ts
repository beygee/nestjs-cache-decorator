import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CacheableModule } from './modules/cache/cacheable.module'
import { AopModule } from '@toss/nestjs-aop'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [AopModule, CacheableModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
