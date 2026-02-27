import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async testDb() {
    // Cambia "usuario" por el nombre REAL del model en tu schema.prisma
    return this.prisma.usuario.findMany({ take: 1 });
  }
}
