import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermisosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permisos.findMany({
      orderBy: { id_permiso: 'asc' },
    });
  }

  async findOne(id_permiso: number) {
    const permiso = await this.prisma.permisos.findUnique({
      where: { id_permiso },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return permiso;
  }
}