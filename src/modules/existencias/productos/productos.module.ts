import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { CategoriaProductoModule } from './categoria-producto/categoria-producto.module';
import { IvaModule } from './iva/iva.module';

@Module({
  imports: [CategoriaProductoModule, IvaModule],
  controllers: [ProductosController],
  providers: [ProductosService, PrismaService],
  exports: [ProductosService],
})
export class ProductosModule {}