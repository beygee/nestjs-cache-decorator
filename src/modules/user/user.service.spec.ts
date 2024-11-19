import { Test, TestingModule } from '@nestjs/testing'

import { UserService } from './user.service'
import { RedisTestContainer } from '../../redis-test-container'
import { INestApplication } from '@nestjs/common'
import { Redis } from 'ioredis'
import { RedisService } from '@liaoliaots/nestjs-redis'
import { UserModule } from './user.module'
import { RedisConfigService } from '../cache/redis-config.service'
import { MockRedisConfigService } from '../test/mock/mock.redis.config.service'
import { AspectModule } from '../aspect/aspect.module'

describe('userService', () => {
  let app: INestApplication
  let moduleRef: TestingModule
  let userService: UserService

  let redisContainer: RedisTestContainer
  let redisService: RedisService
  let redis: Redis
  let mockRedisConfigService: MockRedisConfigService

  beforeAll(async () => {
    // Start Redis container
    redisContainer = new RedisTestContainer()
    await redisContainer.start()

    // Mock 설정
    mockRedisConfigService = new MockRedisConfigService()
    mockRedisConfigService.setConfig(
      redisContainer.getHost(),
      redisContainer.getPort(),
    )

    // Create NestJS testing module
    moduleRef = await Test.createTestingModule({
      imports: [AspectModule, UserModule],
      providers: [UserService],
    })
      .overrideProvider(RedisConfigService)
      .useValue(mockRedisConfigService)
      .compile()

    userService = moduleRef.get<UserService>(UserService)
    redisService = moduleRef.get<RedisService>(RedisService)
    redis = redisService.getOrThrow()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await redisContainer.stop()
  })

  afterEach(async () => {
    await redis.flushall()
  })

  it('should cache the result of getUserById', async () => {
    const userId = '123'

    // First call - should fetch from the method and take around 1 second
    const startTime1 = Date.now()
    const user1 = await userService.getUserById(userId)
    const duration1 = Date.now() - startTime1
    expect(user1).toEqual({ id: userId, name: 'John Doe' })
    expect(duration1).toBeGreaterThanOrEqual(100)

    // Second call - should fetch from cache and take less than 1 second
    const startTime2 = Date.now()
    const user2 = await userService.getUserById(userId)
    const duration2 = Date.now() - startTime2
    expect(user2).toEqual({ id: userId, name: 'John Doe' })
    expect(duration2).toBeLessThan(100)
  })

  it('should update the cache when updateUser is called', async () => {
    const userId = '123'

    // Update user
    const updatedUser = await userService.updateUser({
      id: userId,
      name: 'Jane Doeeeee',
    })
    expect(updatedUser).toEqual({ id: userId, name: 'Jane Doeeeee' })

    // Get user - should return updated data from cache
    const startTime = Date.now()
    const user = await userService.getUserById(userId)
    const duration = Date.now() - startTime
    expect(user).toEqual({ id: userId, name: 'Jane Doeeeee' })
    expect(duration).toBeLessThan(100)
  })

  it('should evict the cache when deleteUserById is called', async () => {
    const userId = '123'

    // Ensure user is cached
    await userService.getUserById(userId)

    // Delete user
    await userService.deleteUserById(userId)

    // 삭제된 사용자 조회 시 에러 발생 확인
    await expect(userService.getUserById(userId)).rejects.toThrow(
      'User not found',
    )
  })
})
