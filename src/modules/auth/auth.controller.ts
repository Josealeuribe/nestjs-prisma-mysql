import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  /**
   * POST /auth/login
   * Recibe email y contraseña
   * Retorna JWT + usuario sin contraseña
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.service.login(dto.email, dto.contrasena);
  }
}
