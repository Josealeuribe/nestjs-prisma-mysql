import { Module } from '@nestjs/common';
import { ProveedoresController } from './proveedores/proveedores.controller';
import { ProveedoresService } from './proveedores/proveedores.service';
import { OrdenesCompraController } from './ordenes-compra/ordenes-compra.controller';
import { OrdenesCompraService } from './ordenes-compra/ordenes-compra.service';
import { RemisionesCompraController } from './remisiones-compra/remisiones-compra.controller';
import { RemisionesCompraService } from './remisiones-compra/remisiones-compra.service';

@Module({
  controllers: [ProveedoresController, OrdenesCompraController, RemisionesCompraController],
  providers: [ProveedoresService, OrdenesCompraService, RemisionesCompraService]
})
export class ComprasModule {}
