import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @Length(1, 100)
  nombre: string;

  @IsString()
  @Length(1, 100)
  apellido: string;

  @IsInt()
  @Min(1)
  id_tipo_doc: number;

  @IsString()
  @Length(1, 20)
  num_documento: string;

  @IsEmail()
  @Length(3, 100)
  email: string;

  @IsInt()
  @Min(1)
  id_rol: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  img_url?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_genero?: number;
}