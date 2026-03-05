import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProveedorDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  codigo_proveedor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  num_documento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre_empresa?: string;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  id_tipo_proveedor?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_tipo_doc?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  id_municipio?: number;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
