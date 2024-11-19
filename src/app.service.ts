import { Injectable } from '@nestjs/common'
import { Cacheable } from './modules/cache/decorators/cacheable.decorator'
@Injectable()
export class AppService {
  public async getHello() {
    return 'Hello World!'
  }

  @Cacheable({ cacheName: 'hello', ttl: 60 })
  public async getCachedHello() {
    return 'Hello World!'
  }
}
