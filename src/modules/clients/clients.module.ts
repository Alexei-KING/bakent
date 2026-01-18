import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientCreditProfile } from './entities/client-credit-profile.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Client, ClientCreditProfile])],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
