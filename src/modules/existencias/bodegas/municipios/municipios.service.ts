import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListMunicipioQueryDto } from './dto/list-municipio.query.dto';

@Injectable()
export class MunicipiosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListMunicipioQueryDto = {}) {
    return this.prisma.municipios.findMany({
      where: {
        ...(query.id_departamento
          ? { id_departamento: query.id_departamento }
          : {}),
      },
      orderBy: { nombre_municipio: 'asc' },
      select: {
        id_municipio: true,
        nombre_municipio: true,
        id_departamento: true,
        departamentos: {
          select: {
            id_departamento: true,
            nombre_departamento: true,
            id_pais: true,
            paises: {
              select: {
                id_pais: true,
                nombre_pais: true,
              },
            },
          },
        },
      },
    });
  }
}