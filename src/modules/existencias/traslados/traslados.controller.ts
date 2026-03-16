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
import { CreateTrasladoDto } from './dto/create-traslado.dto';
import { UpdateTrasladoDto } from './dto/update-traslado.dto';
import { TrasladosService } from './traslados.service';

interface RequestWithUser extends Request {
  user: {
    id_usuario: number;
    bodegasPermitidas?: number[];
  };
}

@UseGuards(AuthGuard('jwt'))
@Controller('traslados')
export class TrasladosController {
  constructor(private readonly trasladosService: TrasladosService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateTrasladoDto) {
    const { id_usuario, bodegasPermitidas } = req.user;

    return this.trasladosService.create(dto, {
      idUsuario: id_usuario,
      bodegasPermitidas,
    });
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query('id_bodega') idBodegaRaw?: string,
  ) {
    const idBodega = idBodegaRaw ? Number(idBodegaRaw) : undefined;

    return this.trasladosService.findAll({
      idBodega,
      bodegasPermitidas: req.user?.bodegasPermitidas,
    });
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id', ParseIntPipe) id: number) {
    return this.trasladosService.findOne(id, {
      bodegasPermitidas: req.user?.bodegasPermitidas,
    });
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