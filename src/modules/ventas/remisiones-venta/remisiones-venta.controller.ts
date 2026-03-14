
import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
  } from '@nestjs/common';
  import { RemisionesVentaService } from './remisiones-venta.service';
  import { CreateRemisionVentaDto } from './dto/create-remision-venta.dto';
  import { UpdateEstadoRemisionVentaDto } from './dto/update-estado-remision-venta.dto';
  
  @Controller('remisiones-venta')
  export class RemisionesVentaController {
    constructor(
      private readonly remisionesVentaService: RemisionesVentaService,
    ) {}
  
    @Post()
    create(@Body() dto: CreateRemisionVentaDto) {
      return this.remisionesVentaService.create(dto);
    }
  
    @Get()
    findAll() {
      return this.remisionesVentaService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.remisionesVentaService.findOne(id);
    }
  
    @Patch(':id/estado')
    updateEstado(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateEstadoRemisionVentaDto,
    ) {
      return this.remisionesVentaService.updateEstado(id, dto);
    }
  }