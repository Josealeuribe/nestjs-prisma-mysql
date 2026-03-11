import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MunicipioService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(includeRefs = false) {
    if (includeRefs) {
      return this.prisma.municipios.findMany({
        orderBy: [
          { departamentos: { nombre_departamento: 'asc' } },
          { nombre_municipio: 'asc' },
        ],
        include: {
          departamentos: true,
        },
      });
    }

    return this.prisma.municipios.findMany({
      orderBy: { nombre_municipio: 'asc' },
      select: {
        id_municipio: true,
        nombre_municipio: true,
        id_departamento: true,
      },
    });
  }
}
