import * as path from 'path';
import type { DataSourceOptions } from 'typeorm';

const config: DataSourceOptions = {
  type: 'mysql',
  port: 3308,
  host: 'localhost',
  username: 'root',
  password: 'root_password',
  database: 'test_db',
  entities: [path.resolve(__dirname, 'src', '**/*.entity.ts')],
  migrations: [path.resolve(__dirname, 'migrations', '*.ts')],
  logging: ['error'],
  timezone: '+09:00',
  charset: 'utf8mb4',
  synchronize: true,
  extra: {
    connectionLimit: 5,
  },
  // cache: {
  //   type: 'redis',
  //   duration: 1000 * 60 * 1,
  //   options: {
  //     socket: {
  //       host: configService.get<string>('REDIS_HOST'),
  //       port: configService.get<number>('REDIS_PORT', 6379),
  //       reconnectStrategy: false,
  //     },
  //   },
  //   ignoreErrors: true,
  // },
};

export default config;
