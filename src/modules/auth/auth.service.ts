import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './jwt.constants';
import * as bcryptjs from 'bcryptjs';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({
    name,
    email,
    password,
    role,
    cedula,
    phone,
    lastname,
  }: CreateAuthDto) {
    const userByEmail = await this.usersService.findOneByEmail(email);
    const userByCedula = await this.usersService.findOneByCedula(cedula);
    if (userByEmail || userByCedula) {
      throw new BadRequestException('El usuario ya existe');
    }
    await this.usersService.create({
      name,
      email,
      password: await bcryptjs.hash(password, 15),
      role,
      cedula,
      phone,
      lastname,
    });
    return {
      message: 'Registro exitoso',
    };
  }

  async login({ cedula, password }: LoginDto) {
    const user = await this.usersService.findOneByCedulaWithPassword(cedula);
    if (!user) {
      throw new UnauthorizedException('El usuario no existe');
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = {
      sub: user.id,
      cedula: user.cedula,
      role: user.role.name,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: jwtConstants.secret,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: jwtConstants.refreshSecret,
    });
    const salt = await bcryptjs.genSalt(10);
    const refreshTokenHash = await bcryptjs.hash(refreshToken, salt);
    await this.usersService.updateRefreshToken(user.id, refreshTokenHash);
    return {
      cedula: user.cedula,
      accessToken,
      refreshToken,
    };
  }
  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.refreshSecret,
      });

      const user = await this.usersService.findOneWithRefreshToken(payload.sub);

      // Logs de depuración (puedes eliminarlos después)
      console.log('Usuario encontrado:', user ? 'SÍ' : 'NO');
      console.log('Hash en BD:', user?.refreshTokenHash ? 'Presente' : 'Nulo');

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Sesión no encontrada o cerrada');
      }

      const isTokenValid = await bcryptjs.compare(token, user.refreshTokenHash);

      if (!isTokenValid) {
        throw new UnauthorizedException('Token de refresco inválido');
      }
      const newPayload = {
        sub: user.id,
        cedula: user.cedula,
        role: user.role.name,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        secret: jwtConstants.secret,
        expiresIn: '15m',
      });

      return {
        accessToken: newAccessToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Sesión expirada o inválida');
    }
  }
  async logout(sub: number) {
    await this.usersService.updateRefreshToken(sub, null);
    return { message: 'Sesión cerrada correctamente' };
  }
  async profile({ cedula, role }: { cedula: string; role: string }) {
    const Profile = await this.usersService.findOneByCedula(cedula);
    return {
      message: 'Perfil encontrado',
      data: Profile,
    };
  }
}
