import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenVentaDto } from './create-orden-venta.dto';

export class UpdateOrdenVentaDto extends PartialType(CreateOrdenVentaDto) {}