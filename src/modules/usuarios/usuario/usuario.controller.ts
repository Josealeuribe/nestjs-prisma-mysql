import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { ListUsuarioQueryDto } from './dto/list-usuario.query.dto';
import { JwtAuthGuard } from 'src/modules/auth/login/jwt/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly service: UsuarioService) {}

  // Get/usuarios
  @Get()
  findAll(@Query() query: ListUsuarioQueryDto) {
    return this.service.findAll(query);
  }

  // Get/usuarios/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CrearUsuarioDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  Update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarUsuarioDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
