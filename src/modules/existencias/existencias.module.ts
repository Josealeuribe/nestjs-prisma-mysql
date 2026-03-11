import { Module } from '@nestjs/common';
import { BodegaController } from './bodegas/bodega/bodegas.controller';
import { BodegaService } from './bodegas/bodega/bodegas.service';
import { ProductosController } from './productos/productos.controller';
import { ProductosService } from './productos/productos.service';
import { TrasladosController } from './traslados/traslados.controller';
import { TrasladosService } from './traslados/traslados.service';
import { ExistenciasController } from './existencias.controller';
import { ExistenciasService } from './existencias.service';

@Module({
  controllers: [
    BodegaController,
    ProductosController,
    TrasladosController,
    ExistenciasController,
  ],
  providers: [
    BodegaService,
    ProductosService,
    TrasladosService,
    ExistenciasService,
  ],
})
export class ExistenciasModule {}
