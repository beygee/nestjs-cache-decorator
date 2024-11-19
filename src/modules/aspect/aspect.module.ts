import { Module } from '@nestjs/common'
import { AopModule } from '@toss/nestjs-aop'
import { CacheableModule } from '../cache/cacheable.module'

@Module({
  imports: [AopModule, CacheableModule],
})
export class AspectModule {}
