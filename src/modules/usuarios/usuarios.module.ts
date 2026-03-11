import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

import { UsuarioController } from './usuario/usuario.controller';
import { UsuarioService } from './usuario/usuario.service';

import { BodegasPorUsuarioService } from './bodega-usuario/bodega-usuario.service';
import { BodegasPorUsuarioController } from './bodega-usuario/bodega-usuario.controller';

import { TipoDocumentoController } from '../usuarios/usuario/tipo-documento/tipo-documento.controller';
import { TipoDocumentoService } from '../usuarios/usuario/tipo-documento/tipo-documento.service';

import { GeneroController } from './genero/genero.controller';
import { GeneroService } from './genero/genero.service';

import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [
    UsuarioController,
    BodegasPorUsuarioController,
    TipoDocumentoController,
    GeneroController,
  ],
  providers: [
    UsuarioService,
    BodegasPorUsuarioService,
    TipoDocumentoService,
    GeneroService,
  ],
})
export class UsuariosModule {}
