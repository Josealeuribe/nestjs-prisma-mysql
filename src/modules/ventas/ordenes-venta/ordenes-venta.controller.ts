import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
  } from '@nestjs/common';
  import { OrdenesVentaService } from './ordenes-venta.service';
  import { CreateOrdenVentaDto } from './dto/create-orden-venta.dto';
  import { UpdateEstadoOrdenVentaDto } from './dto/update-estado-orden-venta.dto';
  
  @Controller('ordenes-venta')
  export class OrdenesVentaController {
    constructor(private readonly ordenesVentaService: OrdenesVentaService) {}
  
    @Post()
    create(@Body() dto: CreateOrdenVentaDto) {
      return this.ordenesVentaService.create(dto);
    }
  
    @Get()
    findAll() {
      return this.ordenesVentaService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.ordenesVentaService.findOne(id);
    }
  
    @Patch(':id/estado')
    updateEstado(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateEstadoOrdenVentaDto,
    ) {
      return this.ordenesVentaService.updateEstado(id, dto);
    }
  }