import {
<<<<<<< HEAD
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
=======
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a

export class UpdateRolDto {
  @IsOptional()
  @IsString()
<<<<<<< HEAD
  @Length(3, 50)
=======
  @MaxLength(50)
  @MinLength(3)
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
  nombre_rol?: string;

  @IsOptional()
  @IsString()
<<<<<<< HEAD
  @Length(10, 200)
=======
  @MaxLength(200)
  @MinLength(10)
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
  descripcion?: string;

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
