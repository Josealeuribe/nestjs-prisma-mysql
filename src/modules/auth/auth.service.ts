import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, contrasena: string) {
    // ✅ Para login necesitamos traer la contraseña hasheada
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: { select: { id_rol: true, nombre_rol: true, estado: true } },
      },
    });

    // ✅ Email no existe
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ✅ Usuario inactivo
    if (!user.estado) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // ✅ Comparar contraseña (texto vs hash)
    const ok = await bcrypt.compare(contrasena, user.contrasena);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ✅ Payload del token (lo mínimo necesario)
    const payload = {
      sub: user.id_usuario,
      email: user.email,
      id_rol: user.id_rol,
    };

    const access_token = await this.jwt.signAsync(payload);

    // ✅ Respuesta sin contraseña
    const { contrasena: _, ...safeUser } = user;

    return {
      access_token,
      user: safeUser,
    };
  }
}
