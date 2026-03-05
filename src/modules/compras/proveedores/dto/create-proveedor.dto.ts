import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProveedorDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo_proveedor?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  num_documento: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre_empresa: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombre_contacto?: string;

  @IsInt()
  @Min(1)
  id_tipo_proveedor: number;

  @IsInt()
  @Min(1)
  id_tipo_doc: number;

  @IsInt()
  @Min(1)
  id_municipio: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
