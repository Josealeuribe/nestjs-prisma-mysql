import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type MailParams = {
  to: string;
  nombre: string;
  enlace: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('MAIL_USER');
    const pass = this.config.get<string>('MAIL_PASS');
    const fromName = this.config.get<string>('MAIL_FROM_NAME') || 'VetManage';

    if (!user || !pass) {
      throw new Error('MAIL_USER y MAIL_PASS son obligatorios en el .env');
    }

    this.from = `"${fromName}" <${user}>`;

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async enviarCreacionContrasena(params: MailParams) {
    const { to, nombre, enlace } = params;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Activa tu cuenta en VetManage',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
          <h2 style="margin-bottom: 8px;">Hola ${nombre},</h2>
          <p>Tu cuenta en <strong>VetManage</strong> ha sido creada correctamente.</p>
          <p>Para definir tu contraseña, haz clic en el siguiente botón:</p>

          <p style="margin: 24px 0;">
            <a
              href="${enlace}"
              style="
                background: #2563eb;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 8px;
                display: inline-block;
                font-weight: 600;
              "
            >
              Crear contraseña
            </a>
          </p>

          <p>Este enlace vence en 24 horas.</p>
          <p>Si no reconoces esta acción, puedes ignorar este correo.</p>

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #6b7280;">VetManage</p>
        </div>
      `,
    });

    this.logger.log(`Correo de creación de contraseña enviado a ${to}`);
  }

  async enviarRestablecimientoContrasena(params: MailParams) {
    const { to, nombre, enlace } = params;

    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Restablece tu contraseña en VetManage',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
          <h2 style="margin-bottom: 8px;">Hola ${nombre},</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña en <strong>VetManage</strong>.</p>
          <p>Haz clic en el siguiente botón para continuar:</p>

          <p style="margin: 24px 0;">
            <a
              href="${enlace}"
              style="
                background: #2563eb;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 8px;
                display: inline-block;
                font-weight: 600;
              "
            >
              Restablecer contraseña
            </a>
          </p>

          <p>Este enlace vence en 24 horas.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>

          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #6b7280;">VetManage</p>
        </div>
      `,
    });

    this.logger.log(`Correo de restablecimiento enviado a ${to}`);
  }
}