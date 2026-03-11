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

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  apellido?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_tipo_doc?: number;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  num_documento?: string;

  @IsOptional()
  @IsEmail()
  @Length(3, 100)
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_rol?: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string | null;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  img_url?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_genero?: number | null;
}
