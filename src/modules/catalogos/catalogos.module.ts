import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { CategoriaProductoController } from './categoria-producto/categoria-producto.controller';
import { CategoriaProductoService } from './categoria-producto/categoria-producto.service';

import { IvaController } from './iva/iva.controller';
import { IvaService } from './iva/iva.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriaProductoController, IvaController],
  providers: [CategoriaProductoService, IvaService],
  exports: [CategoriaProductoService, IvaService],
})
export class CatalogosModule {}
