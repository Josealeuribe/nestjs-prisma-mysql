import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class AsignarPermisosRolDto {
  @IsArray()
  @ArrayUnique()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  permisosIds: number[];
}
