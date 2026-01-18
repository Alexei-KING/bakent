import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategorysService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const categoryData = {
      ...createCategoryDto,
      name: createCategoryDto.name.toUpperCase().trim(),
    };
    const createCategory = await this.categoryRepo.save(categoryData);

    return {
      message: 'Categoria creada correctamente',
      data: createCategory,
    };
  }

  async findAll() {
    const categories = await this.categoryRepo.find();

    return {
      message: 'Categorias listadas correctamente',
      data: categories,
    };
  }

  async findByOne(id: number) {
    const OneCategory = await this.findOne(id);
    return {
      message: 'Categoria listada correctamente',
      data: OneCategory,
    };
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const existCategory = await this.findOne(id);
    const updateCategory = this.categoryRepo.merge(
      existCategory,
      updateCategoryDto,
    );
    const saveCategory = await this.categoryRepo.save(updateCategory);
    return {
      message: 'Categoria actualizada correctamente',
      data: saveCategory,
    };
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    const deleteCategory = await this.categoryRepo.remove(category);
    return {
      message: 'Categoria eliminada correctamente',
      data: deleteCategory,
    };
  }

  private async findOne(id: number) {
    const Category = await this.categoryRepo.findOne({
      where: { id },
    });
    if (!Category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return Category;
  }
}
