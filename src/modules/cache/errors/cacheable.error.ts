export class CacheableError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CacheableError'
  }
}
