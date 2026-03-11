import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/modules/auth/login/jwt/jwt-auth.guard';
import { BodegasPorUsuarioService } from './bodega-usuario.service';
import { AsignarBodegaUsuarioDto } from './dto/asignar-bodega-usuario.dto';

@UseGuards(JwtAuthGuard)
@Controller('bodegas-por-usuario')
export class BodegasPorUsuarioController {
  constructor(private readonly service: BodegasPorUsuarioService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('usuario/:idUsuario')
  findByUsuario(@Param('idUsuario', ParseIntPipe) idUsuario: number) {
    return this.service.findByUsuario(idUsuario);
  }

  @Post()
  create(@Body() dto: AsignarBodegaUsuarioDto) {
    return this.service.create(dto);
  }

  @Delete(':idUsuario/:idBodega')
  remove(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idBodega', ParseIntPipe) idBodega: number,
  ) {
    return this.service.remove(idUsuario, idBodega);
  }
}
