// redis-test-container.ts
import { GenericContainer, StartedTestContainer } from 'testcontainers'

export class RedisTestContainer {
  private container: StartedTestContainer

  async start() {
    this.container = await new GenericContainer('redis')
      .withExposedPorts(6379)
      .start()
  }

  getHost() {
    return this.container.getHost()
  }

  getPort() {
    return this.container.getMappedPort(6379)
  }

  async stop() {
    await this.container.stop()
  }
}
