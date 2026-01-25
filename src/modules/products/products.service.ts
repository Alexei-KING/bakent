import {
  Injectable,
  BadGatewayException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categorys/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryRepo.findOneBy({
      id: createProductDto.categoryId,
    });
    if (!category) {
      throw new NotFoundException('Categoria no valida');
    }
    try {
      const product = this.productRepo.create({
        ...createProductDto,
        category,
      });
      const saveProduct = await this.productRepo.save(product);
      return {
        message: 'Producto creado correctamente',
        data: saveProduct,
      };
    } catch {
      throw new BadGatewayException('Error creating Products');
    }
  }

  async findAll() {
    const products = await this.productRepo.find();
    return {
      message: 'Productos listados correctamente',
      data: products,
    };
  }

  async findOneBy(id: number) {
    const Oneproduct = await this.findOne(id);
    return {
      message: 'Producto listado correctamente',
      data: Oneproduct,
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const existProduct = await this.findOne(id);
      const updateProduct = this.productRepo.merge(
        existProduct,
        updateProductDto,
      );
      const saveProduct = await this.productRepo.save(updateProduct);
      return {
        message: 'Producto actualizado correctamente',
        data: saveProduct,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error update product with id ${id}`);
    }
  }

  private async findOne(id: number) {
    const Producto = await this.productRepo.findOne({
      where: { id },
    });
    if (!Producto) {
      throw new NotFoundException(`Producto with id ${id} not found`);
    }
    return Producto;
  }

  // --- AQUÍ ESTABA EL ERROR ---
  async remove(id: number) {
    // Antes decia: this.productRepository.delete(id)
    // Ahora dice:  this.productRepo.delete(id)
    // (Porque así lo llamaste en el constructor arriba)

    // Primero verificamos si existe (opcional, pero recomendado)
    await this.findOne(id);

    const result = await this.productRepo.delete(id);
    return {
      message: 'Producto eliminado correctamente',
      data: result,
    };
  }
}
