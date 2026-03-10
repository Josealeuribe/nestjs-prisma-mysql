import { ArrayUnique, IsArray, IsInt, Min } from 'class-validator';

export class AsignarPermisosRolDto {
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids_permisos: number[];
}
