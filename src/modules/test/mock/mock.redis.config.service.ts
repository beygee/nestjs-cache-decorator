export class MockRedisConfigService {
  private host: string
  private port: number

  setConfig(host: string, port: number) {
    this.host = host
    this.port = port
  }

  createRedisOptions() {
    return {
      config: {
        host: this.host,
        port: this.port,
      },
    }
  }
}
