import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateExistenciaDto } from './dto/create-existencia.dto';
import { UpdateExistenciaDto } from './dto/update-existencia.dto';
import { ExistenciasService } from './existencias.service';

// 1. Definimos la interfaz aquí mismo
// English: Defining the interface locally to replace 'any'
interface RequestWithUser extends Request {
  user: {
    id_bodega_activa: number;
    bodegasPermitidas?: number[];
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('existencias')
export class ExistenciasController {
  constructor(private readonly existenciasService: ExistenciasService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateExistenciaDto) {
    const { id_bodega_activa, bodegasPermitidas } = req.user;

    return this.existenciasService.create(dto, {
      idBodegaActiva: id_bodega_activa,
      bodegasPermitidas,
    });
  }

  @Get('productos-vista')
  findProductosVista(
    @Req() req: RequestWithUser,
    @Query('scope') scope?: 'active' | 'all',
  ) {
    const { id_bodega_activa, bodegasPermitidas } = req.user;

    return this.existenciasService.findProductosVista({
      idBodegaActiva: id_bodega_activa,
      bodegasPermitidas,
      scope: scope === 'all' ? 'all' : 'active',
    });
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    const { id_bodega_activa, bodegasPermitidas } = req.user;

    return this.existenciasService.findAll({
      idBodegaActiva: id_bodega_activa,
      bodegasPermitidas,
    });
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    const { bodegasPermitidas } = req.user;

    return this.existenciasService.findOne(id, { bodegasPermitidas });
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExistenciaDto,
  ) {
    const { id_bodega_activa, bodegasPermitidas } = req.user;

    return this.existenciasService.update(id, dto, {
      idBodegaActiva: id_bodega_activa,
      bodegasPermitidas,
    });
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    const { bodegasPermitidas } = req.user;

    return this.existenciasService.remove(id, { bodegasPermitidas });
  }
}
