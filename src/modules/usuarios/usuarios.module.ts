import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { UsuarioController } from './usuario/usuario.controller';
import { UsuarioService } from './usuario/usuario.service';

import { BodegasPorUsuarioService } from './bodega-usuario/bodega-usuario.service';
import { BodegasPorUsuarioController } from './bodega-usuario/bodega-usuario.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UsuarioController, BodegasPorUsuarioController],
  providers: [UsuarioService, BodegasPorUsuarioService],
})
export class UsuariosModule {}
