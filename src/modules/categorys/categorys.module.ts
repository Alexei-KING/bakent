import { Module } from '@nestjs/common';
import { CategorysService } from './categorys.service';
import { CategorysController } from './categorys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategorysController],
  providers: [CategorysService],
  exports: [TypeOrmModule, CategorysService],
})
export class CategorysModule {}
