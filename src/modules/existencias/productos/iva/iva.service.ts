import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IvaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.iva.findMany({
      orderBy: { porcentaje: 'asc' },
      select: {
        id_iva: true,
        porcentaje: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.iva.findUnique({
      where: { id_iva: id },
      select: {
        id_iva: true,
        porcentaje: true,
      },
    });
  }
}