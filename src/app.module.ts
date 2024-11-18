import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getMetadataArgsStorage } from 'typeorm'
import config from '../ormconfig'
import { Product } from './entities/product.entity'
import { Category } from './entities/category.entity'
import { RedisModule } from '@liaoliaots/nestjs-redis'
import { AspectModule } from './modules/aspect/aspect.module'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(config, {
          entities: getMetadataArgsStorage().tables.map((tbl) => tbl.target),
          autoLoadEntities: true,
        }),
    }),
    TypeOrmModule.forFeature([Product, Category]),
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6388,
      },
    }),
    AspectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
