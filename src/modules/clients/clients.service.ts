import {
  Injectable,
  NotFoundException,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto'; // Asegúrate de que este archivo exista
import { UpdateClientDto } from './dto/update-client.dto'; // Asegúrate de que este archivo exista
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
    // Separa el límite de crédito del resto de datos
    const { creditLimit, ...personalData } = createClientDto;
    
    const client = this.clientRepository.create(personalData);
    
    // Crea el perfil de crédito automáticamente
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
      relations: ['creditProfile'], // Carga la relación OneToOne
      order: { fullname: 'ASC' }    // Ordena alfabéticamente (Opcional pero útil)
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
      throw new BadGatewayException(`Error update cliente with id ${id}`);
    }
  }

  // Corregí el nombre: processPayent -> processPayment
  async processPayment(id: number, abono: number) {
    const profile = await this.clientCreditProfileRepository.findOne({
      where: { client: { id } },
    });
    
    if (!profile) throw new NotFoundException('Perfil de crédito no encontrado');
    
    if (!profile.isActive)
      throw new BadRequestException('El credito del cliente no esta activo');
    
    if (abono <= 0) {
      throw new BadRequestException('El monto a pagar debe ser mayor a 0');
    }
    
    const debt = Number(profile.currentDebt);

    if (abono > debt) {
      throw new BadRequestException(
        `El abono ($${abono}) supera la deuda actual del cliente ($${debt})`,
      );
    }

    profile.currentDebt = debt - abono;
    const updateProfile = await this.clientCreditProfileRepository.save(profile);
    
    return {
      message: 'Abono realizado con exito',
      data: {
        Deuda: updateProfile.currentDebt,
        CreditoDisponible: Number(updateProfile.creditLimit) - Number(updateProfile.currentDebt),
      },
    };
  }

  // Método privado auxiliar para reutilizar código
  public async findOne(id: number) {
    const Cliente = await this.clientRepository.findOne({
      where: { id },
      relations: ['creditProfile'], // Agregué esto para que al buscar uno también traiga el perfil
    });
    if (!Cliente) {
      throw new NotFoundException(`Cliente with id ${id} not found`);
    }
    return Cliente;
  }
}