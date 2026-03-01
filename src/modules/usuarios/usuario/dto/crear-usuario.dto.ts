import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  MinLength,
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

  @IsString()
  @MinLength(6)
  @Length(6, 255)
  contrasena: string;

  @IsInt()
  @Min(1)
  id_rol: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
