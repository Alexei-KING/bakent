import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, Not, IsNull } from 'typeorm';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateRefreshToken(id: number, refreshTokenHash: string | null) {
    return await this.userRepository.update(id, { refreshTokenHash });
  }

  async findOneWithRefreshToken(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'cedula', 'refreshTokenHash'], // Necesitamos el hash oculto
      relations: ['role'],
    });
  }

  create(createUserDto: CreateUserDto) {
    const user = this.userRepository.save({
      ...createUserDto,
      role: {
        id: createUserDto.role,
      },
    });
    return {
      message: 'Usuario creado correctamente',
      data: user,
    };
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  findOneByCedula(cedula: string) {
    return this.userRepository.findOneBy({ cedula });
  }
  findOneByCedulaWithPassword(cedula: string) {
    return this.userRepository.findOne({
      where: { cedula },
      select: [
        'id',
        'cedula',
        'phone',
        'lastname',
        'name',
        'email',
        'password',
      ],
      relations: ['role'],
    });
  }

  async findAll() {
    const user = await this.userRepository.find();
    return {
      message: 'Usuarios listados correctamente',
      data: user,
    };
  }

  async findByOne(id: number) {
    const user = await this.findOne(id);
    return {
      message: 'Usuario listado correctamente',
      data: user,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const existUser = await this.findOne(id);
      const { role, ...rest } = updateUserDto;
      const dataToUpdate = {
        ...rest,
        role: role ? { id: role } : undefined,
      };
      const updateUser = this.userRepository.merge(existUser, dataToUpdate);
      const saveUser = await this.userRepository.save(updateUser);
      return saveUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Error update user with id ${id}`);
    }
  }
  async remove(id: number) {
    await this.findOne(id);
    const user = await this.userRepository.softDelete(id);

    return {
      message: 'Usuario eliminado correctamente',
      dats: user,
    };
  }

  async findAllDeleted() {
    const deletedUsers = await this.userRepository.find({
      withDeleted: true,
      where: {
        deletedAt: Not(IsNull()),
      },
    });

    return {
      message: 'Usuario  recuperados con éxito',
      data: deletedUsers,
    };
  }

  async restore(id: number) {
    const user = await this.findOne(id, true);

    if (!user.deletedAt) {
      throw new BadRequestException('El usuario no está eliminado');
    }

    await this.userRepository.restore(id);

    return {
      message: 'Usuario  ha sido restaurado correctamente',
      data: user,
    };
  }

  private async findOne(id: number, withDeleted = false) {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted,
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
