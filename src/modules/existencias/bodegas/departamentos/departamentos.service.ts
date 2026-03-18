import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ListDepartamentoQueryDto } from './dto/list-departamento.query.dto';

@Injectable()
export class DepartamentosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListDepartamentoQueryDto = {}) {
    return this.prisma.departamentos.findMany({
      where: {
        ...(query.id_pais ? { id_pais: query.id_pais } : {}),
      },
      orderBy: { nombre_departamento: 'asc' },
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
    });
  }
}