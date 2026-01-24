import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate } from './entities/ExchangeRate.entity';
import { Currency } from './entities/currency.entity';
import { CreateExchangeRateDto } from './dto/create-currency.dto';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly rateRepo: Repository<ExchangeRate>,
    @InjectRepository(Currency)
    private readonly currencyRepo: Repository<Currency>,
  ) {}

  async create(
    createDto: CreateExchangeRateDto,
    user: { sub: number; cedula: string; role: string },
  ) {
    try {
      const newRate = this.rateRepo.create({
        rateValue: createDto.rateValue,
        currency: { id: createDto.currencyId },
        user: { id: user.sub },
      });

      const result = await this.rateRepo.save(newRate);

      return {
        message: 'Tasa de cambio registrada correctamente',
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error al registrar la tasa de cambio',
        data: error.message,
      };
    }
  }

  async getAllCurrencies() {
    try {
      const currencies = await this.currencyRepo.find();
      return {
        message: 'Monedas listadas correctamente',
        data: currencies,
      };
    } catch {
      return {
        message: 'Error al listar las monedas',
      };
    }
  }

  async getAllLatestRates(): Promise<{
    message: string;
    data: ExchangeRate[];
  }> {
    try {
      const latestRates = await this.rateRepo
        .createQueryBuilder('rate')
        .innerJoinAndSelect('rate.currency', 'currency')
        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('MAX(innerRate.createdAt)')
            .from(ExchangeRate, 'innerRate')
            .where('innerRate.currencyId = rate.currencyId')
            .getQuery();
          return 'rate.createdAt = ' + subQuery;
        })
        .orderBy('rate.createdAt', 'DESC')
        .getMany();

      return {
        message: 'Últimas tasas de todas las monedas obtenidas correctamente',
        data: latestRates,
      };
    } catch (error) {
      this.logger.error(
        `Error en getAllLatestRates: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'Error al procesar la solicitud de tasas actuales',
      );
    }
  }
  async getLatestRate(currencyCode: string) {
    const result = await this.rateRepo.findOne({
      where: { currency: { code: currencyCode.toUpperCase() } },
      order: { createdAt: 'DESC' },
      relations: ['currency'],
    });

    if (!result) {
      return {
        message: `No se encontró tasa actual para la moneda: ${currencyCode}`,
        data: null,
      };
    }

    return {
      message: 'Tasa de cambio actual obtenida correctamente',
      data: result,
    };
  }

  async getHistory(currencyId?: number, limit: number = 30) {
    try {
      const where = currencyId ? { currency: { id: currencyId } } : {};

      const result = await this.rateRepo.find({
        where,
        order: { createdAt: 'DESC' },
        take: limit,
        relations: ['currency'],
      });
      return {
        message: 'Historial de tasas obtenido correctamente',
        data: result,
      };
    } catch (error) {
      return {
        message: 'Error al obtener el historial',
        data: null,
      };
    }
  }
}
