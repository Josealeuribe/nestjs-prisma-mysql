import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TipoDocumentoService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tipo_documento.findMany({
      orderBy: { id_tipo_doc: 'asc' },
      select: {
        id_tipo_doc: true,
        nombre_doc: true,
      },
    });
  }
}