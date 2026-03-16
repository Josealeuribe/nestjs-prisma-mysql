import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaisesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.paises.findMany({
      orderBy: { nombre_pais: 'asc' },
      select: {
        id_pais: true,
        nombre_pais: true,
      },
    });
  }
}