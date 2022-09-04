import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';

import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { User } from '../auth/entities/user.entity';



@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>, 

    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
    
  ){
    // console.log('logger', this.logger)
  }

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product =  this.productRepository.create({
        ...productDetails,
        user,
        images: images.map( image =>this.productImagesRepository.create({url: image}) )
      }); // Solo creamos el producto en memoria
      await this.productRepository.save(product); // Guardamos en la BBDD

      return { ...product, images };

    } catch (error) {      
      this.handleDBExceptions(error);
    }
  }

  async findAll( paginationDto: PaginationDto ) {
    const { limit = 10, offset = 0 } = paginationDto;

    const product = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });    

    return product.map( ({images, ...res}) => ({
      ...res,
      images: images.map( img => img.url)
    }));
  }

  async findOne(term: string) {
    let product: Product;
    if(isUUID(term)){
      product = await this.productRepository.findOneBy({
          id: term,
      });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug' , {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if( !product ) throw new NotFoundException(`Product widt id "${ term }" Not Found`);  
    return product;
  }

  async findOnePlain( term: string){
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( images => images.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;
    const  product = await this.productRepository.preload({ id, ...toUpdate });

    if(!product) throw new NotFoundException(`Product widt id "${ id }" Not Found`);  


    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {       

      if( images ) {

        await queryRunner.manager.delete( ProductImage, { product: { id } });
        product.images = images.map( image => this.productImagesRepository.create({ url: image }));
         
      }
      product.user = user;
      await queryRunner.manager.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();      
      return this.findOnePlain( id );
    } catch (error) {
       await queryRunner.rollbackTransaction();
       await queryRunner.release();

      this.handleDBExceptions(error);
    }      
  }

  async remove(id: string) {
    const findProduct = await this.findOne(id);
    await this.productRepository.remove(findProduct);
  }


  private handleDBExceptions(error: any){        
    if( error.code == '23505' ) throw new BadRequestException(error.detail);
    
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server log');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

}
