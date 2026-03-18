import { Module } from '@nestjs/common';
import { BodegaController } from './bodegas/bodega/bodegas.controller';
import { BodegaService } from './bodegas/bodega/bodegas.service';
import { TrasladosController } from './traslados/traslados.controller';
import { TrasladosService } from './traslados/traslados.service';
import { ExistenciasController } from './existencias.controller';
import { ExistenciasService } from './existencias.service';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [ProductosModule],
  controllers: [
    BodegaController,
    TrasladosController,
    ExistenciasController,
  ],
  providers: [
    BodegaService,
    TrasladosService,
    ExistenciasService,
  ],
})
export class ExistenciasModule {}
