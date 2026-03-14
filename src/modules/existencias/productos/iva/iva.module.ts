import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IvaController } from './iva.controller';
import { IvaService } from './iva.service';

@Module({
  controllers: [IvaController],
  providers: [IvaService, PrismaService],
  exports: [IvaService],
})
export class IvaModule {}