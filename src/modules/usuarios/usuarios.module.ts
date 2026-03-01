import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { UsuarioController } from './usuario/usuario.controller';
import { UsuarioService } from './usuario/usuario.service';

import { BodegaUsuarioController } from './bodega-usuario/bodega-usuario.controller';
import { BodegaUsuarioService } from './bodega-usuario/bodega-usuario.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsuarioController, BodegaUsuarioController],
  providers: [UsuarioService, BodegaUsuarioService],
})
export class UsuariosModule {}
