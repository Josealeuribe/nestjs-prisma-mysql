import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class ActualizarMiPerfilDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras',
  })
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo puede contener letras',
  })
  apellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^\d{10}$/, {
    message: 'El teléfono debe tener 10 dígitos numéricos',
  })
  telefono?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_genero?: number;
}