import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule, // ✅ IMPORTANTE para que ConfigService esté en este contexto
    JwtModule.registerAsync({
      imports: [ConfigModule], // ✅ aún más explícito
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET is missing in .env');

        // (elige tu expiresIn: si estás usando '86400' como string, conviértelo a number)
        const expiresIn = Number(
          config.get<string>('JWT_EXPIRES_IN') ?? '86400',
        );

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
