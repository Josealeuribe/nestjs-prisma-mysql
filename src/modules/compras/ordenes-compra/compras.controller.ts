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
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateCompraDto) {
    const idUsuario = req.user.id_usuario;

    // ✅ bodega activa desde JWT (misma lógica que findAll)
    const idBodegaActiva = req.user.id_bodega_activa;

    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    return this.comprasService.create(dto, {
      idUsuario,
      idBodegaActiva,
      bodegasPermitidas,
    });
  }

  @Get()
  findAll(@Req() req: any, @Query('id_bodega') id_bodega?: string) {
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;

    // si viene id_bodega por query lo usamos, si no usamos la activa
    const idBodegaActiva = req.user.id_bodega_activa;
    const idBodegaScope = id_bodega ? Number(id_bodega) : idBodegaActiva;

    return this.comprasService.findAll({
      idBodegaScope,
      bodegasPermitidas,
    });
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;
    return this.comprasService.findOne(id, { bodegasPermitidas });
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompraDto,
  ) {
    const idUsuario = req.user.id_usuario;
    const bodegasPermitidas = req.user.bodegasPermitidas as number[] | undefined;
    return this.comprasService.update(id, dto, { idUsuario, bodegasPermitidas });
  }
}
