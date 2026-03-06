import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateExistenciaDto } from './dto/create-existencia.dto';
import { UpdateExistenciaDto } from './dto/update-existencia.dto';
import { ExistenciasService } from './existencias.service';

@UseGuards(AuthGuard('jwt'))
@Controller('existencias')
export class ExistenciasController {
  constructor(private readonly existenciasService: ExistenciasService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateExistenciaDto) {
    const idBodegaActiva = req.user.id_bodega_activa;
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    return this.existenciasService.create(dto, {
      idBodegaActiva,
      bodegasPermitidas,
    });
  }

  @Get()
  findAll(@Req() req: any) {
    const idBodegaActiva = req.user.id_bodega_activa;
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    return this.existenciasService.findAll({
      idBodegaActiva,
      bodegasPermitidas,
    });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    return this.existenciasService.findOne(id, { bodegasPermitidas });
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExistenciaDto,
  ) {
    const idBodegaActiva = req.user.id_bodega_activa;
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    return this.existenciasService.update(id, dto, {
      idBodegaActiva,
      bodegasPermitidas,
    });
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    return this.existenciasService.remove(id, { bodegasPermitidas });
  }
}
