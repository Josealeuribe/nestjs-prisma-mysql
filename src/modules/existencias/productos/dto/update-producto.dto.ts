import { PartialType } from '@nestjs/swagger';
import { CreateProductoDto } from './crear-producto.dto';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {}
