import { Module, OnModuleInit, Injectable } from '@nestjs/common'
import {
  DiscoveryModule,
  DiscoveryService,
  Reflector,
  MetadataScanner,
} from '@nestjs/core'
import { ASPECT } from './aspect.decorator'
import { LazyDecorator } from './aspect.interface'

@Injectable()
export class AspectService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders()

    const aspectClasses = providers
      .filter((wrapper) => {
        const { instance } = wrapper
        if (!instance) return false
        const isAspect = this.reflector.get<boolean>(
          ASPECT,
          instance.constructor,
        )
        return isAspect
      })
      .map((wrapper) => wrapper.instance as LazyDecorator)

    const classes = providers
      .filter(
        (wrapper) =>
          wrapper.instance && Object.getPrototypeOf(wrapper.instance),
      )
      .map((wrapper) => wrapper.instance)

    for (const instance of classes) {
      const prototype = Object.getPrototypeOf(instance)

      this.metadataScanner.scanFromPrototype(
        instance,
        prototype,
        (methodName) => {
          for (const aspect of aspectClasses) {
            aspect.wrap(this.reflector, instance, methodName)
          }
        },
      )
    }
  }
}

@Module({
  imports: [DiscoveryModule],
  providers: [AspectService],
})
export class AspectModule {}
