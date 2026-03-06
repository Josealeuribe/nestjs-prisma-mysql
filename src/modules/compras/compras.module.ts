import { Module } from '@nestjs/common';
import { ProveedoresController } from './proveedores/proveedores.controller';
import { ProveedoresService } from './proveedores/proveedores.service';
import { ComprasController } from './ordenes-compra/compras.controller';

import { RemisionesCompraController } from './remisiones-compra/remisiones-compra.controller';
import { RemisionesCompraService } from './remisiones-compra/remisiones-compra.service';
import { ComprasService } from './ordenes-compra/compras.service';

@Module({
  controllers: [
    ProveedoresController,
    ComprasController,
    RemisionesCompraController,
  ],

  providers: [ProveedoresService, ComprasService, RemisionesCompraService],
})
export class ComprasModule {}
