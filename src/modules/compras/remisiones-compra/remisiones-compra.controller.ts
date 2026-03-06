import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateRemisionCompraDto } from './dto/create-remision-compra.dto';
import { UpdateRemisionCompraDto } from './dto/update-remision-compra.dto';
import { RemisionesCompraService } from './remisiones-compra.service';

@UseGuards(AuthGuard('jwt'))
@Controller('remisiones-compra')
export class RemisionesCompraController {
  constructor(
    private readonly remisionesCompraService: RemisionesCompraService,
  ) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateRemisionCompraDto) {
    const idUsuario = req.user.id_usuario;
    const idBodegaActiva = req.user.id_bodega_activa;
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    return this.remisionesCompraService.create(dto, {
      idUsuario,
      idBodegaActiva,
      bodegasPermitidas,
    });
  }

  @Get()
  findAll(@Req() req: any, @Query('id_compra') id_compra?: string) {
    const idBodegaActiva = req.user.id_bodega_activa;
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    return this.remisionesCompraService.findAll({
      idBodegaActiva,
      bodegasPermitidas,
      idCompra: id_compra ? Number(id_compra) : undefined,
    });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;
    return this.remisionesCompraService.findOne(id, { bodegasPermitidas });
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRemisionCompraDto,
  ) {
    const idUsuario = req.user.id_usuario;
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    return this.remisionesCompraService.update(id, dto, {
      idUsuario,
      bodegasPermitidas,
    });
  }
}
