import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRolDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombre_rol?: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}
