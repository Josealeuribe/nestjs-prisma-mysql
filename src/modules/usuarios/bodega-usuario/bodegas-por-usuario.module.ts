import { Module } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BodegasPorUsuarioController } from './bodega-usuario.controller';
import { BodegasPorUsuarioService } from './bodega-usuario.service';

@Module({
  controllers: [BodegasPorUsuarioController],
  providers: [BodegasPorUsuarioService, PrismaService],
  exports: [BodegasPorUsuarioService],
})
export class BodegasPorUsuarioModule {}
