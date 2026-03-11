import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SolicitarRestablecimientoDto } from './dto/solicitar-restablecimiento.dto';
import { generarTokenPlano, hashToken } from 'src/common/utils/password-setup.util';
import { MailService } from '../mail/mail.service';

@Injectable()
export class RestablecerContrasenaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  async solicitarRestablecimiento(dto: SolicitarRestablecimientoDto) {
    const email = dto.email.trim().toLowerCase();

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: {
        id_usuario: true,
        nombre: true,
        email: true,
        estado: true,
      },
    });

    if (!usuario || !usuario.estado) {
      return {
        message:
          'Si el correo existe en el sistema, se generará un enlace para restablecer la contraseña.',
      };
    }

    const tokenPlano = generarTokenPlano();
    const tokenHash = hashToken(tokenPlano);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 horas

    await this.prisma.$transaction(async (tx) => {
      await tx.password_setup_token.deleteMany({
        where: { id_usuario: usuario.id_usuario },
      });

      await tx.password_setup_token.create({
        data: {
          id_usuario: usuario.id_usuario,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      });
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const enlace = `${frontendUrl}/restablecer-contrasena?token=${tokenPlano}`;

    await this.mailService.enviarRestablecimientoContrasena({
      to: usuario.email,
      nombre: usuario.nombre,
      enlace,
    });

    return {
      message:
        'Si el correo existe en el sistema, se enviará un enlace para restablecer la contraseña.',
    };
  }
}