import { Type } from 'class-transformer';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class ProcessPaymentDto {
  @IsNumber()
  @IsPositive({ message: 'El abono debe ser un número mayor a cero' })
  @Min(0.01)
  @Type(() => Number) // Esto asegura la conversión de string a número
  abono: number;
}
