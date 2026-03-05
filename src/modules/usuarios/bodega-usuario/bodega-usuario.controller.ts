import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AsignarBodegaUsuarioDto } from './dto/asignar-bodega-usuario.dto';
import { BodegasPorUsuarioService } from './bodega-usuario.service';

type JwtUser = {
  sub: number;
  id_rol?: number;
  id_bodega_activa?: number | null;
};

@Controller('bodegas-por-usuario')
export class BodegasPorUsuarioController {
  constructor(private readonly service: BodegasPorUsuarioService) {}

  @Post('asignar')
  asignar(@Body() dto: AsignarBodegaUsuarioDto) {
    return this.service.asignar(dto);
  }

  // ✅ PRIMERO las rutas fijas
  @UseGuards(AuthGuard('jwt'))
  @Get('mis-bodegas')
  misBodegas(@Req() req: Request) {
    const user = req.user as JwtUser;
    return this.service.misBodegas(user.sub);
  }

  // ✅ DESPUÉS las rutas dinámicas
  @Get(':id_usuario')
  bodegasDeUsuario(@Param('id_usuario', ParseIntPipe) id_usuario: number) {
    return this.service.bodegasDeUsuario(id_usuario);
  }

  @Delete('usuario/:id_usuario/:id_bodega')
  quitar(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_bodega', ParseIntPipe) id_bodega: number,
  ) {
    return this.service.quitar(id_usuario, id_bodega);
  }
}
