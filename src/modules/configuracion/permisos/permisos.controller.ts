import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PermisosService } from './permisos.service';

@Controller('permisos')
export class PermisosController {
  constructor(private readonly service: PermisosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}