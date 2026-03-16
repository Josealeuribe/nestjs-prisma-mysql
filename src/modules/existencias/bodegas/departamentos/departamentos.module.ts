import { Module } from '@nestjs/common';
import { DepartamentosController } from './departamentos.controller';
import { DepartamentosService } from './departamentos.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DepartamentosController],
  providers: [DepartamentosService, PrismaService],
  exports: [DepartamentosService],
})
export class DepartamentosModule {}