import {
  Injectable,
  NotFoundException,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './entities/client.entity';
import { ClientCreditProfile } from './entities/client-credit-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private clientRepository: Repository<Client>,
    @InjectRepository(ClientCreditProfile)
    private clientCreditProfileRepository: Repository<ClientCreditProfile>,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const { creditLimit, ...personalData } = createClientDto;
    const client = this.clientRepository.create(personalData);

    const profile = new ClientCreditProfile();
    profile.creditLimit = creditLimit || 0;
    profile.currentDebt = 0;
    profile.isActive = true;

    client.creditProfile = profile;

    const savedClient = await this.clientRepository.save(client);
    return {
      message: 'Cliente creado correctamente',
      data: savedClient,
    };
  }

  async findAll() {
    const AllClients = await this.clientRepository.find({
      relations: ['creditProfile'],
      order: { fullname: 'ASC' },
    });
    return {
      message: 'Clientes listados correctamente',
      data: AllClients,
    };
  }

  async findByOne(id: number) {
    const OneClient = await this.findOne(id);
    return {
      message: 'Cliente listado correctamente',
      data: OneClient,
    };
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    try {
      const existClient = await this.findOne(id);
      const updateClient = this.clientRepository.merge(
        existClient,
        updateClientDto,
      );
      const saveClient = await this.clientRepository.save(updateClient);
      return {
        message: 'Cliente actualizado correctamente',
        data: saveClient,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadGatewayException('Error update cliente');
    }
  }
  async processPayment(id: number, abono: number) {
    const profile = await this.clientCreditProfileRepository.findOne({
      where: { client: { id } },
    });

    if (!profile)
      throw new NotFoundException('Perfil de crédito no encontrado');

    const currentDebt = Number(profile.currentDebt || 0);
    const creditLimit = Number(profile.creditLimit || 0);

    if (abono > currentDebt) {
      throw new BadRequestException(
        `El abono ($${abono}) supera la deuda ($${currentDebt})`,
      );
    }

    const nuevaDeuda = currentDebt - abono;
    profile.currentDebt = nuevaDeuda;

    await this.clientCreditProfileRepository.save(profile);

    return {
      message: 'Abono realizado con éxito',
      data: {
        Deuda: nuevaDeuda,
        CreditoDisponible: creditLimit - nuevaDeuda,
      },
    };
  }
  public async findOne(id: number) {
    const Cliente = await this.clientRepository.findOne({
      where: { id },
      relations: ['creditProfile'],
    });
    if (!Cliente) {
      throw new NotFoundException(`Cliente with id ${id} not found`);
    }
    return Cliente;
  }
}
