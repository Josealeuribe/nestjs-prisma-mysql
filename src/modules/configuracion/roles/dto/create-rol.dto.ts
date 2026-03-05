import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRolDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  nombre_rol: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean; // si no viene, Prisma pone true por default
}
