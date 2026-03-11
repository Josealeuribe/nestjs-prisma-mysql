import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/login/jwt/jwt-auth.guard';
import { TipoDocumentoService } from './tipo-documento.service';

@UseGuards(JwtAuthGuard)
@Controller('tipo-documento')
export class TipoDocumentoController {
  constructor(private readonly service: TipoDocumentoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}