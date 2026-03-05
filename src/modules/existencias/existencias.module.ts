import { Module } from '@nestjs/common';
import { BodegaController } from './bodegas/bodegas.controller';
import { BodegaService } from './bodegas/bodegas.service';
import { ProductosController } from './productos/productos.controller';
import { ProductosService } from './productos/productos.service';
import { TrasladosController } from './traslados/traslados.controller';
import { TrasladosService } from './traslados/traslados.service';

@Module({
  controllers: [BodegaController, ProductosController, TrasladosController],
  providers: [BodegaService, ProductosService, TrasladosService],
})
export class ExistenciasModule {}
