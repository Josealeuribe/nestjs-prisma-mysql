import { Module } from '@nestjs/common';
import { TipoDocumentoController } from './tipo-documento.controller';
import { TipoDocumentoService } from './tipo-documento.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService, PrismaService],
  exports: [TipoDocumentoService],
})
export class TipoDocumentoModule {}
