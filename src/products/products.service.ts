import { DataSource, Repository } from 'typeorm';
import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { PaginationDTO } from '../common/dtos/pagination.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService')
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    
    private readonly dataSource: DataSource,

  ){}

  async create(createProductDto: CreateProductDto) {

    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }) )
      });

      await this.productRepository.save( product );

      return { ...product, images };

    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(PaginationDTO: PaginationDTO) {
    const {limit=10, offset} = PaginationDTO
    const products = await  this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });

    return products.map(product => ({
      ...product,
      images: product.images.map( image =>  image.url )
    }))
  }

  async findOne(term: string) {
    let product: Product

    if(isUUID(term)){
      product = await this.productRepository.findOneBy({id:term})
    }else{
      // product = await this.productRepository.findOneBy({slug:term})

      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug',{
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images','prodImages')
        .getOne()
    }

    if(!product ) throw new NotFoundException(`Product not exist`)
    return  product;
  }

  async oneProdPlain (term : string) {
    const {images =[], ...rest} = await this.findOne(term)
    return {
      ...rest,
      images: images.map(image => image.url),
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

      const {images, ...toUpdate} = updateProductDto
      const product = await this.productRepository.preload({
        id:id,
        ...toUpdate
      })

      if(!product ) throw new NotFoundException(`Product not exist`)

      const queryRunner = this.dataSource.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.startTransaction()

    try {

      if( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } });

        product.images = images.map( 
          image => this.productImageRepository.create({ url: image }) 
        )
      }

      // await this.productRepository.save( product );
      await queryRunner.manager.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.oneProdPlain( id );

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBException(error);
    }

  }

  remove(id: string) {

    const product = this.findOne(id)
    if(!product ) throw new NotFoundException(`Product not exist`)

    this.productRepository.delete(id)

    return `Deleted`;
  }

  async deleteAllProducts () {

    const query = await this.productRepository.createQueryBuilder('product')
    try {
      return await query
        .delete()
        .where({})
        .execute()

    } catch (error) {
      this.handleDBException(error)
    }
  }
  handleDBException(error: any) {
    console.log('error', error)
    if( error.code === '23505')
        throw new BadRequestException(error.detail)
      this.logger.error(error)
      throw new InternalServerErrorException(`error ayudaa`);
  }

}
