import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common'

export const ASPECT = Symbol('ASPECT_CLASS')

export function Aspect() {
  return applyDecorators(SetMetadata(ASPECT, 'ASPECT_CLASS'), Injectable)
}
