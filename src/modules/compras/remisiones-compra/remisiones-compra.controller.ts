import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express'; // Necesario para tipar el objeto de la petición
import { RemisionesCompraService } from './remisiones-compra.service';
import { CreateRemisionCompraDto } from './dto/create-remision-compra.dto';
import { UpdateRemisionCompraDto } from './dto/update-remision-compra.dto';
import { CambiarEstadoRemisionCompraDto } from './dto/estado-remision-compra.dto';

// --- 1. INTERFACES ESTRICTAS ---

/** Lo que viene dentro del objeto Request (inyectado por Passport o tu JWT Strategy) */
export interface AuthUserPayload {
  idUsuario?: number | string;
  id_usuario?: number | string;
  sub?: number | string;
  idBodegaActiva?: number | string;
  id_bodega_activa?: number | string;
  id_bodega?: number | string;
  bodegasPermitidas?: (number | string)[];
  bodegas_permitidas?: (number | string)[];
}

/** Estructura final limpia que usará tu controlador y servicios */
export interface AuthData {
  idUsuario: number;
  idBodegaActiva: number | null;
  bodegasPermitidas: number[];
}

/** Tipado para extender el Request de Express y evitar el 'any' en req.user */
interface RequestWithUser extends Request {
  user: AuthUserPayload;
}

// --- 2. DECORADOR SIN 'ANY' ---

export const GetAuthData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthData => {
    // Tipamos el Request para que TS sepa que .user existe y tiene forma de AuthUserPayload
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    // Extraemos con fallback para cubrir todos tus casos de nombres de variables
    const rawIdUsuario = user.idUsuario ?? user.id_usuario ?? user.sub ?? null;
    const rawIdBodega =
      user.idBodegaActiva ?? user.id_bodega_activa ?? user.id_bodega ?? null;
    const rawBodegas = user.bodegasPermitidas ?? user.bodegas_permitidas ?? [];

    if (rawIdUsuario === null) {
      throw new UnauthorizedException('No se pudo identificar el usuario');
    }

    return {
      idUsuario: Number(rawIdUsuario),
      idBodegaActiva: rawIdBodega !== null ? Number(rawIdBodega) : null,
      bodegasPermitidas: Array.isArray(rawBodegas)
        ? rawBodegas.map(Number)
        : [],
    };
  },
);

// --- 3. CONTROLADOR 100% TIPADO ---

@UseGuards(AuthGuard('jwt'))
@Controller('remisiones-compra')
export class RemisionesCompraController {
  constructor(private readonly service: RemisionesCompraService) {}

  @Post()
  create(@Body() dto: CreateRemisionCompraDto, @GetAuthData() auth: AuthData) {
    if (!auth.idBodegaActiva) {
      throw new UnauthorizedException('No se encontró la bodega activa');
    }

    return this.service.create(dto, {
      idUsuario: auth.idUsuario,
      idBodegaActiva: auth.idBodegaActiva,
      bodegasPermitidas: auth.bodegasPermitidas,
    });
  }

  @Get()
  findAll(@GetAuthData() auth: AuthData, @Query('idCompra') idCompra?: string) {
    if (!auth.idBodegaActiva) {
      throw new UnauthorizedException('No se encontró la bodega activa');
    }

    return this.service.findAll({
      idBodegaActiva: auth.idBodegaActiva,
      bodegasPermitidas: auth.bodegasPermitidas,
      idCompra: idCompra ? Number(idCompra) : undefined,
    });
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetAuthData() auth: AuthData,
  ) {
    return this.service.findOne(id, {
      bodegasPermitidas: auth.bodegasPermitidas,
    });
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRemisionCompraDto,
    @GetAuthData() auth: AuthData,
  ) {
    return this.service.update(id, dto, {
      idUsuario: auth.idUsuario,
      bodegasPermitidas: auth.bodegasPermitidas,
    });
  }

  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoRemisionCompraDto,
    @GetAuthData() auth: AuthData,
  ) {
    return this.service.cambiarEstado(id, dto, {
      idUsuario: auth.idUsuario,
      bodegasPermitidas: auth.bodegasPermitidas,
    });
  }
}
