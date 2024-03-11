import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './interface/products-seed.interface';

@Injectable()
export class SeedService {

  constructor (
    private readonly productService: ProductsService
  ){}
  async runSeed() {
    await this.insertNewProducts()
    return 'seed executed'
  }

  private async insertNewProducts() {
    await this.productService.deleteAllProducts()

    const newProducts = initialData.products

    const insertPromises = []

    newProducts.forEach((product) => {
      insertPromises.push(this.productService.create(product))
    })

    await Promise.all(insertPromises)

    return true
  }
}
