import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriaProductoController } from './categoria-producto.controller';
import { CategoriaProductoService } from './categoria-producto.service';

@Module({
  controllers: [CategoriaProductoController],
  providers: [CategoriaProductoService, PrismaService],
  exports: [CategoriaProductoService],
})
export class CategoriaProductoModule {}