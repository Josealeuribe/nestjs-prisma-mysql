import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import * as bcrypt from 'bcrypt';
import { usuarioSelect } from './usuario.select';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // ✅ No traemos contrasena desde BD
    return this.prisma.usuario.findMany({
      orderBy: { id_usuario: 'desc' },
      select: usuarioSelect,
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: usuarioSelect,
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CrearUsuarioDto) {
    // ✅ Hashear contrasena antes de guardar (nunca texto plano)
    const hash = await bcrypt.hash(dto.contrasena, 10);

    const created = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        apellido: dto.apellido,
        id_tipo_doc: dto.id_tipo_doc,
        num_documento: dto.num_documento,
        email: dto.email,
        contrasena: hash, // ✅ guardamos hash
        id_rol: dto.id_rol,
        estado: dto.estado ?? true,
      },
      select: usuarioSelect, // ✅ respuesta sin contrasena
    });

    return created;
  }

  async update(id: number, dto: ActualizarUsuarioDto) {
    // ✅ valida existencia
    const exists = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true },
    });
    if (!exists) throw new NotFoundException('Usuario no encontrado');

    // ✅ Si viene contrasena, la hasheamos
    const data: any = { ...dto };
    if (dto.contrasena) {
      data.contrasena = await bcrypt.hash(dto.contrasena, 10);
    }

    const updated = await this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
      select: usuarioSelect,
    });

    return updated;
  }

  async remove(id: number) {
    // ✅ valida existencia
    const exists = await this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true },
    });
    if (!exists) throw new NotFoundException('Usuario no encontrado');

    // ✅ eliminamos y devolvemos usuario sin contrasena
    return this.prisma.usuario.delete({
      where: { id_usuario: id },
      select: usuarioSelect,
    });
  }
}
