import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './modules/user/user.module'
import { AspectModule } from './modules/aspect/aspect.module'

@Module({
  imports: [AspectModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
