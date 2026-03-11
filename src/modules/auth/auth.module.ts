import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthController } from './login/auth.controller';
import { AuthService } from './login/auth.service';
import { JwtStrategy } from './login/jwt/jwt.strategy';
import { CrearContrasenaController } from './crear-contrasena.controller';
import { CrearContrasenaService } from './crear-contrasena.service';
import { RestablecerContrasenaService } from './restablecer-contrasena.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev_secret_change_me',
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [AuthController, CrearContrasenaController],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    CrearContrasenaService,
    RestablecerContrasenaService,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}