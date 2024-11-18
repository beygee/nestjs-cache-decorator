import { Injectable } from '@nestjs/common'
import { Cache } from '@nestjs/cache-manager'
import { Cacheable } from '../cache/decorators/cacheable.decorator'
import { CachePut } from '../cache/decorators/cache-put.decorator'
import { CacheEvict } from '../cache/decorators/cache-evict.decorator'
import { UserStore } from './user.store'

interface User {
  id: string
  name: string
}

@Injectable()
export class UserService {
  private userStore: UserStore

  constructor(private cacheManager: Cache) {
    this.userStore = UserStore.getInstance()
  }

  @Cacheable({ cacheName: 'user', key: (args: any[]) => args[0], ttl: 60 })
  async getUserById(id: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const user = this.userStore.getUser(id)
    if (!user) throw new Error('User not found')

    return user
  }

  @CachePut({ cacheName: 'user', key: (args: any[]) => args[0].id })
  async updateUser(userData: User): Promise<User> {
    this.userStore.setUser(userData)
    return userData
  }

  @CacheEvict({ cacheName: 'user', key: (args: any[]) => args[0] })
  async deleteUserById(id: string): Promise<void> {
    this.userStore.deleteUser(id)
  }

  async getAllUsers(): Promise<User[]> {
    return this.userStore.getAllUsers()
  }
}
