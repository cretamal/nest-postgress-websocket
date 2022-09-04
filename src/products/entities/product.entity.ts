import { User } from "../../auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { ProductImage } from './';

@Entity({ name: 'products' })
export class Product {
    @ApiProperty({
        example: '3c122e46-0af8-4136-92b7-242b58202ce5',
        description: 'Product IS',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid') // Define un uuid en una columna
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', { // Definimos una columna Text
        unique: true
    })
    title: string;

    @ApiProperty(
        {
            example: 0,
            description: 'Product Price'
        }
    )
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty(
        {
            example: 'Introducing the Tesla Chill Collection. The Men’s Chill Crew Neck Sweatshirt has a premium, heavyweight exterior and soft fleece interior for comfort in any season. The sweatshirt features a subtle thermoplastic polyurethane T logo on the chest and a Tesla wordmark below the back collar. Made from 60% cotton and 40% recycled polyester.',
            description: 'Product Description',
            default: null
        }
    )
    @Column({ // otra forma de definir el data type
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty(
        {
            example: 't_shirt_teslo',
            description: 'Product Slug - for SEO',
            uniqueItems: true
        }
    )
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty(
        {
            example: 10,
            description: 'Product Stock',
            default: 0
        }
    )
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty(
        {
            example: ['M', 'L', 'XL', 'XXL'],
            description: 'Product Sizes'            
        }
    )
    @Column('text', {
        array: true
    })
    sizes: string[]

    @ApiProperty(
        {
            example: 'women',
            description: 'Product Gender'            
        }
    )
    @Column('text')
    gender: string

    @ApiProperty(
        {
            example: ['shirt', 'hoodie', 'sweatshirt'],
            description: 'Product Tags',
            default: []
        }
    )
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]


    @OneToMany( 
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    @ApiProperty(
        {
            example: ['8764734-00-A_0_2000.jpg', '8764734-00-A_0_2001.jpg', '8764734-00-A_0_2002.jpg'],
            description: 'Product Images',            
        }
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true}
    )
    user: User
    // Antes de Insertar a la BBDD

    @BeforeInsert()
    checkSlug(){
        if( !this.slug ){
            this.slug = this.title
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate(){

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

}
