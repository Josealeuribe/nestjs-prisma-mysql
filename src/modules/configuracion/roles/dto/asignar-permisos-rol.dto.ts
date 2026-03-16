<<<<<<< HEAD
import { ArrayUnique, IsArray, IsInt, Min } from 'class-validator';

export class AsignarPermisosRolDto {
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids_permisos: number[];
}
=======
import { ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AsignarPermisosRolDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids_permisos: number[];
}
>>>>>>> 1d97f8d42da8fa688f1e06bedcb6a1393c7aff1a
