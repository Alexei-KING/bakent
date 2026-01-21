import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { ClientsModule } from './modules/clients/clients.module';
import { SalesModule } from './modules/sales/sales.module';

import { InventoryModule } from './modules/inventory/inventory.module';
import { CategorysModule } from './modules/categorys/categorys.module';
import { CurrencyModule } from './modules/currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'papeleria',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    ClientsModule,
    SalesModule,
    InventoryModule,
    CategorysModule,
    CurrencyModule,
  ],

  providers: [],
})
export class AppModule {}
