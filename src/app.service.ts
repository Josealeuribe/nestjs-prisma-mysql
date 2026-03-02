import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async testDb() {
    return this.prisma.usuario.findMany({ take: 1 });
  }
}
