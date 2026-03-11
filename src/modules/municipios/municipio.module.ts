import { Module } from '@nestjs/common';
import { MunicipioController } from './municipio.controller';
import { MunicipioService } from './municipio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MunicipioController],
  providers: [MunicipioService, PrismaService],
  exports: [MunicipioService],
})
export class MunicipioModule {}
