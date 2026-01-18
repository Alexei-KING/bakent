import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';

import { DataSource, Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { Client } from '../clients/entities/client.entity';
import { Product } from '../products/entities/product.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async create(
    createSaleDto: CreateSaleDto,
    user: { sub: number; cedula: string; role: string },
  ) {
    console.log('Usuario:', user);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { clientId, paymentMethodId, items } = createSaleDto;
      let totalSale = 0;
      const saleDetails: SaleDetail[] = [];

      // validacion del metodo de pago
      const paymentMethodEntity = await queryRunner.manager.findOne(
        PaymentMethod,
        {
          where: { id: paymentMethodId },
        },
      );
      if (!paymentMethodEntity) {
        throw new NotFoundException('Método de pago no válido');
      }

      // validar cliente
      const client = await queryRunner.manager.findOne(Client, {
        where: { id: clientId },
        relations: ['creditProfile'],
      });

      if (!client) throw new NotFoundException('Cliente no encontrado');

      for (const item of items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (!product) throw new NotFoundException('Producto no encontrado');

        if (product.stock < item.quantity) {
          throw new BadRequestException('No hay suficiente stock del producto');
        }

        await queryRunner.manager.update(Product, product.id, {
          stock: product.stock - item.quantity,
        });

        const subtotal = Number(product.price) * item.quantity;
        totalSale += subtotal;

        const detail = queryRunner.manager.create(SaleDetail, {
          product: { id: product.id },
          quantity: item.quantity,
          priceAtSale: product.price,
        });
        saleDetails.push(detail);
      }

      if (paymentMethodEntity.name === 'CREDIT') {
        const profile = client.creditProfile;

        if (!profile || !profile.isActive) {
          throw new BadRequestException(
            'El credito del cliente no esta activo',
          );
        }
        const currentDabt = Number(profile.currentDebt);
        const creditLimit = Number(profile.creditLimit);

        if (currentDabt + totalSale > creditLimit) {
          throw new BadRequestException(
            'Credito insuficiente para realizar la compra',
          );
        }

        profile.currentDebt = currentDabt + totalSale;
        await queryRunner.manager.save(profile);
      }

      const sale = queryRunner.manager.create(Sale, {
        total: totalSale,
        paymentMethod: { id: paymentMethodId },
        client: { id: client.id },
        user: { id: user.sub },
        saleDetails: saleDetails,
      });

      const savedSale = await queryRunner.manager.save(sale);
      await queryRunner.commitTransaction();
      const finalSale = await this.findOne(savedSale.id);
      return {
        message: 'Venta realizada con exito',
        data: finalSale,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    const sales = await this.dataSource.getRepository(Sale).find({
      relations: ['client', 'user', 'saleDetails', 'saleDetails.product'],
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'Ventas listadas correctamente',
      data: sales,
    };
  }
  async findAllpaymentMethod() {
    const paymentMethods = await this.paymentMethodRepository.find();

    return {
      message: 'Metodos de pago listados correctamente',
      data: paymentMethods,
    };
  }

  async findOne(id: number) {
    const sale = await this.dataSource.getRepository(Sale).findOne({
      where: { id },
      relations: [
        'client',
        'client.creditProfile',
        'user',
        'saleDetails',
        'saleDetails.product',
      ],
    });

    if (!sale) {
      throw new NotFoundException(`La venta no existe`);
    }

    return {
      message: 'Venta encontrada',
      data: sale,
    };
  }
}
