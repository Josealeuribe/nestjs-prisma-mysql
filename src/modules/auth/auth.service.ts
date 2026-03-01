import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Login con email + contraseña:
   * - Verifica existencia del usuario
   * - Verifica estado activo
   * - Compara contraseña en texto plano vs hash (bcrypt)
   * - Retorna JWT + usuario sin contraseña
   */
  async login(email: string, plainPassword: string) {
    // ✅ Para login necesitamos traer el hash de la contraseña
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

    // ✅ Comparar contraseña en texto plano con el hash almacenado
    const ok = await bcrypt.compare(plainPassword, user.contrasena);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ✅ Payload mínimo del token
    const payload = {
      sub: user.id_usuario,
      email: user.email,
      id_rol: user.id_rol,
    };

    // ✅ Generar JWT
    const access_token = await this.jwt.signAsync(payload);

    // ✅ Nunca devolver contrasena al cliente
    const { contrasena, ...safeUser } = user;

    return {
      access_token,
      user: safeUser,
    };
  }
}
