import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ProductsService } from 'src/products/products.service';
import { initialData } from './interface/products-seed.interface';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {

  constructor (
    private readonly productService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){}
  async runSeed() {
    await this.deleteTables()
    const adminUser = await this.insertUsers()
    await this.insertNewProducts( adminUser )
    return 'seed executed'
  }

  private async deleteTables(){
    await this.productService.deleteAllProducts()
    const queryBuilder = this.userRepository.createQueryBuilder()

    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertUsers() {
    const seedUsers = initialData.users
    const users: User[]=[]

    seedUsers.forEach(user => {
      user.password=  bcrypt.hashSync(user.password,10)

      users.push(this.userRepository.create(user))
    });

    const dbUser = await this.userRepository.save(seedUsers)

    return dbUser[0]
  }

  
  private async insertNewProducts( user : User) {
    await this.productService.deleteAllProducts()

    const newProducts = initialData.products

    const insertPromises = []

    newProducts.forEach((product) => { 
      insertPromises.push(this.productService.create(product, user))
    })

    await Promise.all(insertPromises)

    return true
  }
}
