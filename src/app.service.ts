import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { Transactional } from '@solidarite/typeorm-transactional-cls-hooked';

@Injectable()
export class AppService {
  private readonly redis: Redis | null;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }
  public async getHello() {
    // console.time('fetchProducts1');
    // console.log('fetchProducts1');
    // await Promise.all(
    //   Array.from({ length: 10000 }).map(() => this.fetchProducts1()),
    // );
    // console.timeEnd('fetchProducts1');

    // console.time('fetchProducts2');
    // console.log('fetchProducts2');
    // await Promise.all(
    //   Array.from({ length: 10000 }).map(() => this.fetchProducts2()),
    // );
    // console.timeEnd('fetchProducts2');

    // console.time('fetchProducts3');
    // console.log('fetchProducts3');
    // await Promise.all(
    //   Array.from({ length: 10000 }).map(() => this.fetchProducts3()),
    // );
    // console.timeEnd('fetchProducts3');

    console.time('fetchProducts4');
    console.log('fetchProducts4');
    await Promise.all(
      Array.from({ length: 10000 }).map(() => this.fetchProducts4()),
    );
    console.timeEnd('fetchProducts4');

    return 'Hello World!';
  }

  private async fetchProducts1() {
    const products = await this.productRepository.find({
      take: 20,
      order: { id: 'DESC' },
      relations: ['category'],
    });

    return products;
  }

  private async fetchProducts2() {
    const products = await this.productRepository.find({
      take: 20,
      order: { id: 'DESC' },
    });

    const categoryIds = products.map((product) => product.categoryId);

    const categories = await this.categoryRepository.findBy({
      id: In(categoryIds),
    });

    products.forEach((product) => {
      product.category = categories.find(
        (category) => category.id === product.categoryId,
      );
    });

    return products;
  }

  private async fetchProducts3() {
    const products = await this.productRepository.find({
      take: 20,
      order: { id: 'DESC' },
    });

    const categoryIds = products.map((product) => product.categoryId);

    const categories = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const categoryCache = await this.redis?.get(`category:${categoryId}`);
        if (categoryCache) {
          return JSON.parse(categoryCache);
        }

        const category = this.categoryRepository.findOneBy({
          id: categoryId,
        });

        this.redis?.set(`category:${categoryId}`, JSON.stringify(category));

        return category;
      }),
    );

    products.forEach((product) => {
      product.category = categories.find(
        (category) => category.id === product.categoryId,
      );
    });

    return products;
  }

  @Transactional()
  private async fetchProducts4() {
    const productsCache = await this.redis?.get(`products`);
    let products: Product[] = null;
    if (productsCache) {
      products = JSON.parse(productsCache);
    }

    if (!products) {
      products = await this.productRepository.find({
        take: 20,
        order: { id: 'DESC' },
      });
      this.redis?.set(`products`, JSON.stringify(products));
    }

    const categoryIds = products.map((product) => product.categoryId);

    const categories = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const categoryCache = await this.redis?.get(`category:${categoryId}`);
        if (categoryCache) {
          return JSON.parse(categoryCache);
        }

        const category = this.categoryRepository.findOneBy({
          id: categoryId,
        });

        this.redis?.set(`category:${categoryId}`, JSON.stringify(category));

        return category;
      }),
    );

    products.forEach((product) => {
      product.category = categories.find(
        (category) => category.id === product.categoryId,
      );
    });

    return products;
  }
}
