import { Module } from '@nestjs/common';
import { BodegasController } from './bodegas/bodegas.controller';
import { BodegasService } from './bodegas/bodegas.service';
import { ProductosController } from './productos/productos.controller';
import { ProductosService } from './productos/productos.service';
import { TrasladosController } from './traslados/traslados.controller';
import { TrasladosService } from './traslados/traslados.service';

@Module({
  controllers: [BodegasController, ProductosController, TrasladosController],
  providers: [BodegasService, ProductosService, TrasladosService]
})
export class ExistenciasModule {}
