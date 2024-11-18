import { Reflector } from '@nestjs/core'

export interface Decorator {
  (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void
}

export interface LazyDecorator {
  wrap(
    reflector: Reflector,
    instance: any,
    methodName: string,
  ): Decorator | undefined
}
