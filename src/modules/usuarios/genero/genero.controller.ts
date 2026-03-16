import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/login/jwt/jwt-auth.guard';
import { GeneroService } from './genero.service';

@UseGuards(JwtAuthGuard)
@Controller('genero')
export class GeneroController {
  constructor(private readonly service: GeneroService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}