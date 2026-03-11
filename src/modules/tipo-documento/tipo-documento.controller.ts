import { Controller, Get, UseGuards } from '@nestjs/common';
import { TipoDocumentoService } from './tipo-documento.service';
import { JwtAuthGuard } from 'src/modules/auth/login/jwt/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tipo-documento')
export class TipoDocumentoController {
  constructor(private readonly service: TipoDocumentoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
