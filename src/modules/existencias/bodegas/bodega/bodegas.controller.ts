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
} from '@nestjs/common';
import {
  BodegaService,
  BodegasFindAllResponse,
  BodegaPayload,
} from './bodegas.service';
import { CreateBodegaDto } from './dto/create-bodega.dto';
import { UpdateBodegaDto } from './dto/update-bodega.dto';
import { ListBodegaQueryDto } from './dto/list-bodega.query.dto';

@Controller('bodega')
export class BodegaController {
  constructor(private readonly service: BodegaService) {}

  @Post()
  create(@Body() dto: CreateBodegaDto): Promise<BodegaPayload> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: ListBodegaQueryDto): Promise<BodegasFindAllResponse> {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeMunicipio') includeMunicipio?: 'true' | 'false',
  ) {
    return this.service.findOne(id, includeMunicipio !== 'false');
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBodegaDto,
  ): Promise<BodegaPayload> {
    return this.service.update(id, dto);
  }

  @Patch(':id/disable')
  disable(@Param('id', ParseIntPipe) id: number): Promise<BodegaPayload> {
    return this.service.disable(id);
  }

  @Patch(':id/enable')
  enable(@Param('id', ParseIntPipe) id: number): Promise<BodegaPayload> {
    return this.service.enable(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<BodegaPayload> {
    return this.service.remove(id);
  }
}