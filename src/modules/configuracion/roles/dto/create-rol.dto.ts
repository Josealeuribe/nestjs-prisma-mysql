import {
  ArrayUnique,
  IsArray,
  IsBoolean,
<<<<<<< HEAD
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
=======
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsInt,
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRolDto {
  @IsString()
<<<<<<< HEAD
  @IsNotEmpty()
  @Length(3, 50)
  nombre_rol: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 200)
=======
  @MaxLength(50)
  @MinLength(3)
  nombre_rol: string;

  @IsString()
  @MaxLength(200)
  @MinLength(10)
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
  descripcion: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
<<<<<<< HEAD
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids_permisos?: number[];
}
=======
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids_permisos?: number[];
}
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
