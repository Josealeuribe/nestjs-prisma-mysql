import { Module } from '@nestjs/common';
import { PermisosController } from './permisos.controller';
import { PermisosService } from './permisos.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PermisosController],
  providers: [PermisosService, PrismaService],
  exports: [PermisosService],
})
export class PermisosModule {}