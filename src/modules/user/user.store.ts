interface User {
  id: string
  name: string
}

export class UserStore {
  private static instance: UserStore
  private users: Map<string, User>

  private constructor() {
    this.users = new Map<string, User>()
    this.users.set('123', { id: '123', name: 'John Doe' })
  }

  static getInstance(): UserStore {
    if (!UserStore.instance) {
      UserStore.instance = new UserStore()
    }
    return UserStore.instance
  }

  // 사용자 생성/수정
  setUser(user: User): void {
    this.users.set(user.id, user)
  }

  // 사용자 조회
  getUser(id: string): User | undefined {
    return this.users.get(id)
  }

  // 사용자 삭제
  deleteUser(id: string): boolean {
    return this.users.delete(id)
  }

  // 모든 사용자 조회
  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }
}
