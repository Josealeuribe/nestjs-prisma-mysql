import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { BodegaController } from './bodega/bodegas.controller';
import { BodegaService } from './bodega/bodegas.service';

import { DepartamentosController } from './departamentos/departamentos.controller';
import { DepartamentosService } from './departamentos/departamentos.service';

import { MunicipiosController } from './municipios/municipios.controller';
import { MunicipiosService } from './municipios/municipios.service';

import { PaisesController } from './paises/paises.controller';
import { PaisesService } from './paises/paises.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    BodegaController,
    DepartamentosController,
    MunicipiosController,
    PaisesController,
  ],
  providers: [
    BodegaService,
    DepartamentosService,
    MunicipiosService,
    PaisesService,
  ],
})
export class BodegasModule {}