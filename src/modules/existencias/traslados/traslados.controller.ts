import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTrasladoDto } from './dto/create-traslado.dto';
import { UpdateTrasladoDto } from './dto/update-traslado.dto';
import { TrasladosService } from './traslados.service';

// 1. Definimos la interfaz aquí mismo para evitar el "any"
// English: We define the interface here to avoid the "any" type.
interface RequestWithUser extends Request {
  user: {
    id_usuario: number;
    id_bodega_activa: number;
    bodegasPermitidas?: number[];
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('traslados')
export class TrasladosController {
  constructor(private readonly trasladosService: TrasladosService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateTrasladoDto) {
    // Usamos desestructuración para limpiar el código
    const { id_usuario, id_bodega_activa, bodegasPermitidas } = req.user;

    return this.trasladosService.create(dto, {
      idUsuario: id_usuario,
      idBodegaActiva: id_bodega_activa,
      bodegasPermitidas,
    });
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    const { id_bodega_activa, bodegasPermitidas } = req.user;

    return this.trasladosService.findAll({
      idBodegaActiva: id_bodega_activa,
      bodegasPermitidas,
    });
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    const { bodegasPermitidas } = req.user;

    return this.trasladosService.findOne(id, { bodegasPermitidas });
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrasladoDto,
  ) {
    const { id_usuario, bodegasPermitidas } = req.user;

    return this.trasladosService.update(id, dto, {
      idUsuario: id_usuario,
      bodegasPermitidas,
    });
  }
}
